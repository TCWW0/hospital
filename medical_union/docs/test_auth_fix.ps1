# 测试修复后的注册接口

# 测试用例1：注册新用户
$testUser = @{
    username = "修复测试用户$(Get-Random -Maximum 1000)"
    password = "password123"
    role = "PATIENT"
    phone = "139$(Get-Random -Minimum 10000000 -Maximum 99999999)"
} | ConvertTo-Json

Write-Host "测试注册接口..."
Write-Host "请求数据: $testUser"

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/register" -Method POST -ContentType "application/json" -Body $testUser
    Write-Host "✅ 注册成功!" -ForegroundColor Green
    Write-Host "响应: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Green
    
    # 保存用户信息用于登录测试
    $registeredUser = $testUser | ConvertFrom-Json
    
    # 测试用例2：使用注册的用户登录
    Write-Host "`n测试登录接口..."
    $loginData = @{
        phone = $registeredUser.phone
        password = $registeredUser.password
        userType = $registeredUser.role
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method POST -ContentType "application/json" -Body $loginData
    Write-Host "✅ 登录成功!" -ForegroundColor Green
    Write-Host "响应: $($loginResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Green
    
    # 测试用例3：获取用户信息
    Write-Host "`n测试获取用户信息接口..."
    $headers = @{
        Authorization = "Bearer $($loginResponse.data.token)"
    }
    
    $userInfoResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/user/info" -Method GET -Headers $headers
    Write-Host "✅ 获取用户信息成功!" -ForegroundColor Green
    Write-Host "响应: $($userInfoResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Green
    
    Write-Host "`n🎉 所有测试通过！Auth模块工作正常！" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ 测试失败:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "错误详情: $responseBody" -ForegroundColor Red
    }
}