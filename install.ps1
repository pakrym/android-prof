# ==============================================================================
# 
# Fervent Coder Copyright 2011 - Present - Released under the Apache 2.0 License
# 
# Copyright 2007-2008 The Apache Software Foundation.
#  
# Licensed under the Apache License, Version 2.0 (the "License"); you may not use 
# this file except in compliance with the License. You may obtain a copy of the 
# License at 
#
#     http://www.apache.org/licenses/LICENSE-2.0 
# 
# Unless required by applicable law or agreed to in writing, software distributed 
# under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR 
# CONDITIONS OF ANY KIND, either express or implied. See the License for the 
# specific language governing permissions and limitations under the License.
# ==============================================================================

# variables

function Download-File {
param (
  [string]$url,
  [string]$file
 )
  Write-Host "Downloading $url to $file"
  $downloader = new-object System.Net.WebClient
  $downloader.DownloadFile($url, $file)
}

Download-File 'http://raw.githubusercontent.com/pakrym/android-prof/master/index.html' 'index.html'
Download-File 'http://raw.githubusercontent.com/pakrym/android-prof/master/profiler.cmd' 'profiler.cmd'
Download-File 'http://raw.githubusercontent.com/pakrym/android-prof/master/profiler.ps1' 'profiler.ps1'