namespace RealEstateHub.API;

/// <summary>Đọc file .env đơn giản (KEY=VALUE, bỏ dòng trống và dòng bắt đầu bằng #).</summary>
public static class DotEnv
{
    public static IReadOnlyDictionary<string, string?> Read(string path)
    {
        var values = new Dictionary<string, string?>(StringComparer.OrdinalIgnoreCase);
        if (!File.Exists(path)) return values;

        foreach (var raw in File.ReadAllLines(path))
        {
            var line = raw.Trim();
            if (line.Length == 0 || line.StartsWith('#')) continue;
            if (line.StartsWith("export ", StringComparison.Ordinal)) line = line[7..].TrimStart();
            var eq = line.IndexOf('=');
            if (eq <= 0) continue;

            var key = line[..eq].Trim();
            var value = line[(eq + 1)..].Trim();
            if (value.Length >= 2 && (value[0] == '"' && value[^1] == '"' || value[0] == '\'' && value[^1] == '\''))
                value = value[1..^1];
            values[key] = value;
        }
        return values;
    }
}
