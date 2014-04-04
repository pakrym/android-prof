
#Load-Packages
$global:job = $null

$routes = @{
    "/" = { return [System.IO.File]::ReadAllText("index.html") }
    "/js" = { return [System.IO.File]::ReadAllText("profiler.js") }
    "/start" = {
        Write-Host "Starting job"
        $global:job = Start-Job -scriptblock {
            adb logcat
        }
        Receive-Job -Job $global:job;
        return 'OK';
    }
    "/log" = { 
        if ($global:job -eq $null)
        {
            return "NO JOB"
        }
        return (Receive-Job -Job $global:job) -join "`r`n" | Out-String
    }
    "/stop" = {

        if ($global:job -eq $null)
        {
            return "NO JOB"
        }
        Stop-Job -Job $global:job
        $global:job = $null
        return 'OK';
    }
}
 
$url = 'http://localhost:12333/'
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($url)
$listener.Start()
 
Start-Process -FilePath  $url
Write-Host "Listening at $url..."



while ($listener.IsListening)
{
    $context = $listener.GetContext()
    
        $requestUrl = $context.Request.Url
        $response = $context.Response
     
        Write-Host ''
        Write-Host "> $requestUrl"
     
        $localPath = $requestUrl.LocalPath
        $route = $routes.Get_Item($requestUrl.LocalPath)
     
        if ($route -eq $null)
        {
            $response.StatusCode = 404
        }
        else
        {
            $content = & $route
            $buffer = [System.Text.Encoding]::UTF8.GetBytes($content)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
        }
        $response.Close()
     
        $responseStatus = $response.StatusCode
        Write-Host "< $responseStatus"
    
}