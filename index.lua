local HttpService = game:GetService("HttpService")

-- default headers (Roblox HttpService cuma bisa set sebagian)
local headers = {
	["Content-Type"] = "application/x-www-form-urlencoded",
	["User-Agent"] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", -- belum tentu diterima
	["X-Requested-With"] = "XMLHttpRequest"
}

-- fungsi encode form-data
local function toFormData(tbl)
	local parts = {}
	for k, v in pairs(tbl) do
		table.insert(parts, HttpService:UrlEncode(k) .. "=" .. HttpService:UrlEncode(tostring(v)))
	end
	return table.concat(parts, "&")
end

-- Start game
local function startAkinator(lang)
	lang = lang or "id"
	local url = "https://" .. lang .. ".akinator.com/game"
	local body = toFormData({ cm = "false", sid = 1 })

	local success, result = pcall(function()
		return HttpService:RequestAsync({
			Url = url,
			Method = "POST",
			Headers = headers,
			Body = body
		})
	end)

	if success and result.Success then
		print("✅ Response status:", result.StatusCode)
		print("📄 Raw HTML:\n", result.Body:sub(1, 500)) -- hanya print 500 char pertama
	else
		warn("❌ Gagal request:", result and result.StatusCode, result and result.StatusMessage)
	end
end

startAkinator("id")
