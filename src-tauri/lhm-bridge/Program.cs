// LHM Bridge — LibreHardwareMonitor 温度采集桥接程序
//
// 通过 LibreHardwareMonitorLib 读取 CPU/GPU/主板温度（底层使用 MSR + 内核驱动，
// 需要管理员权限加载驱动），以 JSON Lines 格式持续输出到 stdout：
//
//   {"cpu_temp":55.2,"gpu_temp":65.1,"mb_temp":42.0,"timestamp":1723000000000}
//
// 用法：
//   lhm-bridge           持续输出（每 1 秒一行），Ctrl+C 退出
//   lhm-bridge --once    只输出一次后退出（用于测试/诊断）
//
// 退出码：
//   0  正常（--once 模式成功输出）
//   1  初始化失败（驱动加载失败 / 无管理员权限 / 无可用传感器）

using System.Text.Json;
using System.Text.Json.Serialization;
using LibreHardwareMonitor.Hardware;

namespace LhmBridge;

/// <summary>输出数据结构（与 Rust 端 serde 字段对应），AOT source-generated JSON</summary>
[JsonSerializable(typeof(TempSnapshot))]
internal partial class JsonContext : JsonSerializerContext { }

/// <summary>温度快照</summary>
class TempSnapshot
{
    public double? cpu_temp { get; set; }
    public double? gpu_temp { get; set; }
    public double? mb_temp { get; set; }
    public long timestamp { get; set; }
}

/// <summary>LHM 0.9.6 使用 visitor 模式刷新硬件数据</summary>
class UpdateVisitor : IVisitor
{
    public void VisitComputer(IComputer computer) => computer.Traverse(this);

    public void VisitHardware(IHardware hardware)
    {
        hardware.Update();
        foreach (var sub in hardware.SubHardware)
        {
            sub.Accept(this);
        }
    }

    public void VisitSensor(ISensor sensor) { }
    public void VisitParameter(IParameter parameter) { }
}

class Program
{
    /// <summary>是否只输出一次</summary>
    static bool onceMode = false;

    /// <summary>是否输出完整硬件树（诊断用）</summary>
    static bool debugMode = false;

    static int Main(string[] args)
    {
        onceMode = args.Contains("--once");
        debugMode = args.Contains("--debug");
        // WinExe 子系统（无控制台）下设置 OutputEncoding 会抛"句柄无效"，
        // 此时 stdout 仍可写入管道（Rust 端 piped 读取），跳过编码设置即可
        try
        {
            Console.OutputEncoding = System.Text.Encoding.UTF8;
        }
        catch (IOException)
        {
            // 无控制台句柄（GUI 子系统 / 隐藏窗口），忽略
        }

        // 检测 PawnIO 内核驱动是否已安装（CPU/主板温度读取的前提）
        if (!LibreHardwareMonitor.PawnIo.PawnIo.IsInstalled)
        {
            // 输出错误标记（Rust 端识别后回退 WMI），stderr 给详细说明
            Console.WriteLine("{\"error\":\"PAWNIO_NOT_INSTALLED\"}");
            Console.Error.WriteLine(
                "PawnIO driver is not installed. CPU/motherboard temperatures are unavailable. " +
                "Install it from https://pawnio.eu and run as administrator to enable full sensor readings.");
            return 2;
        }

        var computer = new Computer
        {
            IsCpuEnabled = true,
            IsGpuEnabled = true,
            IsMotherboardEnabled = true,
        };

        try
        {
            computer.Open();
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"ERROR: failed to open hardware: {ex.Message}");
            return 1;
        }

        try
        {
            // 首次刷新，确认是否有可用传感器（驱动加载失败时此处会暴露）
            computer.Accept(new UpdateVisitor());
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"ERROR: hardware update failed: {ex.Message}");
            computer.Close();
            return 1;
        }

        if (debugMode)
        {
            DumpTree(computer);
        }

        // 后台线程监控 stdin：父进程退出时管道关闭（EOF），bridge 随之退出，避免孤儿进程
        // （--once 测试模式跳过：一次性模式自身会退出，且测试时 stdin 常为 EOF 会误触发）
        if (!onceMode)
        {
            var stdinWatcher = new Thread(() =>
            {
                try
                {
                    while (Console.In.Read() != -1) { }
                }
                catch { /* 管道异常直接退出 */ }
                Environment.Exit(0);
            })
            {
                IsBackground = true
            };
            stdinWatcher.Start();
        }

        var visitor = new UpdateVisitor();

        // 持续输出（Ctrl+C 由系统终止，无需额外处理）
        while (true)
        {
            try
            {
                computer.Accept(visitor);
                var snap = Collect(computer);
                // 输出 JSON Lines（source-generated，AOT 安全）
                Console.WriteLine(JsonSerializer.Serialize(snap, JsonContext.Default.TempSnapshot));
                Console.Out.Flush();
            }
            catch (Exception ex)
            {
                // 采集失败不退出，输出错误后继续（驱动偶发失败可自愈）
                Console.Error.WriteLine($"WARN: update failed: {ex.Message}");
            }

            if (onceMode)
                break;

            Thread.Sleep(1000);
        }

        computer.Close();
        return 0;
    }

    /// <summary>遍历硬件树，收集温度传感器</summary>
    static TempSnapshot Collect(Computer computer)
    {
        double? cpuTemp = null;
        double? gpuTemp = null;
        double? mbTemp = null;

        foreach (var hardware in computer.Hardware)
        {
            Walk(hardware, ref cpuTemp, ref gpuTemp, ref mbTemp);
            foreach (var sub in hardware.SubHardware)
            {
                Walk(sub, ref cpuTemp, ref gpuTemp, ref mbTemp);
            }
        }

        return new TempSnapshot
        {
            cpu_temp = cpuTemp,
            gpu_temp = gpuTemp,
            mb_temp = mbTemp,
            timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
        };
    }

    /// <summary>遍历单个硬件节点，取温度最高的传感器</summary>
    static void Walk(
        IHardware hardware,
        ref double? cpuTemp,
        ref double? gpuTemp,
        ref double? mbTemp)
    {
        foreach (var sensor in hardware.Sensors)
        {
            if (sensor.SensorType != SensorType.Temperature || !sensor.Value.HasValue)
                continue;

            var temp = sensor.Value!.Value;

            switch (hardware.HardwareType)
            {
                case HardwareType.Cpu:
                    // 优先 "Package"（封装温度，最接近真实 CPU 温度），
                    // 没有 Package 时才取最大核心温度
                    if (sensor.Name.Contains("Package", StringComparison.OrdinalIgnoreCase))
                    {
                        cpuTemp = temp;
                    }
                    else if (cpuTemp is null)
                    {
                        cpuTemp = Math.Max(cpuTemp ?? double.MinValue, temp);
                    }
                    break;
                case HardwareType.GpuNvidia:
                case HardwareType.GpuAmd:
                case HardwareType.GpuIntel:
                    if (sensor.Name.Contains("Hot Spot", StringComparison.OrdinalIgnoreCase) ||
                        sensor.Name.Contains("Core", StringComparison.OrdinalIgnoreCase))
                        gpuTemp = temp;
                    else
                        gpuTemp = Math.Max(gpuTemp ?? double.MinValue, temp);
                    break;
                case HardwareType.Motherboard:
                    mbTemp = Math.Max(mbTemp ?? double.MinValue, temp);
                    break;
            }
        }
    }

    /// <summary>输出完整硬件树（诊断用）</summary>
    static void DumpTree(Computer computer)
    {
        foreach (var hardware in computer.Hardware)
        {
            Console.WriteLine($"HW: {hardware.HardwareType} / {hardware.Name}");
            foreach (var sensor in hardware.Sensors)
            {
                Console.WriteLine($"  SENSOR: {sensor.SensorType} / {sensor.Name} = {sensor.Value?.ToString("F1")}");
            }
            foreach (var sub in hardware.SubHardware)
            {
                Console.WriteLine($"  SUB-HW: {sub.HardwareType} / {sub.Name}");
                foreach (var sensor in sub.Sensors)
                {
                    Console.WriteLine($"    SENSOR: {sensor.SensorType} / {sensor.Name} = {sensor.Value?.ToString("F1")}");
                }
            }
        }
    }
}
