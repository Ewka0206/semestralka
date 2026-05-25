@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM   http://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@REM ----------------------------------------------------------------------------
@REM Apache Maven Wrapper startup batch script
@REM ----------------------------------------------------------------------------

@SETLOCAL

@SET MAVEN_PROJECTBASEDIR=%~dp0
@IF "%MAVEN_PROJECTBASEDIR:~-1%" == "\" @SET "MAVEN_PROJECTBASEDIR=%MAVEN_PROJECTBASEDIR:~0,-1%"

@SET MAVEN_WRAPPER_PROPERTIES="%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.properties"

@FOR /F "usebackq tokens=1,2 delims==" %%A IN (%MAVEN_WRAPPER_PROPERTIES%) DO (
    @IF "%%A" == "distributionUrl" @SET DISTRIBUTION_URL=%%B
)

@SET MAVEN_USER_HOME=%USERPROFILE%\.m2
@SET MAVEN_WRAPPER_CACHE=%MAVEN_USER_HOME%\wrapper\dists

@FOR /F "tokens=*" %%i IN ('powershell -NoLogo -NoProfile -Command "([uri]'%DISTRIBUTION_URL%').Segments[-1] -replace '\.zip$',''"') DO @SET MAVEN_DIST_NAME=%%i

@FOR /F "tokens=*" %%i IN ('powershell -NoLogo -NoProfile -Command "'%MAVEN_DIST_NAME%' -replace '-bin$','' "') DO @SET MAVEN_INNER_DIR=%%i
@SET MAVEN_HOME=%MAVEN_WRAPPER_CACHE%\%MAVEN_DIST_NAME%\%MAVEN_INNER_DIR%

@IF EXIST "%MAVEN_HOME%\bin\mvn.cmd" GOTO RUN_MAVEN

@ECHO Downloading Maven %MAVEN_DIST_NAME% ...
@MKDIR "%MAVEN_WRAPPER_CACHE%\%MAVEN_DIST_NAME%" 2>NUL
@SET MAVEN_ZIP=%MAVEN_WRAPPER_CACHE%\%MAVEN_DIST_NAME%.zip
@powershell -NoLogo -NoProfile -Command "Invoke-WebRequest -Uri '%DISTRIBUTION_URL%' -OutFile '%MAVEN_ZIP%'"
@powershell -NoLogo -NoProfile -Command "Expand-Archive -Path '%MAVEN_ZIP%' -DestinationPath '%MAVEN_WRAPPER_CACHE%\%MAVEN_DIST_NAME%' -Force"
@DEL "%MAVEN_ZIP%"
@ECHO Maven downloaded.

:RUN_MAVEN
@SET JAVA_EXECUTABLE=%JAVA_HOME%\bin\java.exe
@IF NOT EXIST "%JAVA_EXECUTABLE%" @SET JAVA_EXECUTABLE=java

"%MAVEN_HOME%\bin\mvn.cmd" %*

@ENDLOCAL
