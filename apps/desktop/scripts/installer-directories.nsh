!include "LogicLib.nsh"

Var snhFinalDirectory
Var snhNewDirectory
Var snhOldDirectory
Var snhOldMoved
Var snhNewMoved
Var snhDirectoryError
Var snhDirectorySource
Var snhDirectoryDestination
Var snhRestoreError
Var snhDirectoryLogDirectory
Var snhRecoveryStopped

; MoveFileEx preserves the destination and exposes the Windows error before rollback changes it.
; Open files inside a directory can make its rename return access denied (5).
!macro snhDirectoryOperation SOURCE DESTINATION RESULT PHASE
  Push $0
  Push $1
  Push $2
  StrCpy $0 0
  ${Do}
    ${If} "${DESTINATION}" == ""
      System::Call 'kernel32::RemoveDirectoryW(w "${SOURCE}") i.r1 ?e'
    ${Else}
      System::Call 'kernel32::MoveFileExW(w "${SOURCE}", w "${DESTINATION}", i 0) i.r1 ?e'
    ${EndIf}
    Pop ${RESULT}
    ${If} "${DESTINATION}" == ""
      ${If} ${RESULT} == 2
      ${OrIf} ${RESULT} == 3
        StrCpy $1 1
      ${EndIf}
    ${EndIf}
    ${If} $1 != 0
      StrCpy ${RESULT} 0
      ${ExitDo}
    ${EndIf}
    ClearErrors
    FileOpen $2 "$PLUGINSDIR\directory-operations.log" a
    ${IfNot} ${Errors}
      FileSeek $2 0 END
      FileWrite $2 "${PHASE}: Windows error: ${RESULT}$\r$\n"
      FileClose $2
    ${EndIf}
    ${If} ${RESULT} != 5
    ${AndIf} ${RESULT} != 32
    ${AndIf} ${RESULT} != 33
      ${ExitDo}
    ${EndIf}
    IntOp $0 $0 + 1
    ${If} $0 >= 10
      ${ExitDo}
    ${EndIf}
    IntOp $1 $0 * 250
    Sleep $1
  ${Loop}
  Pop $2
  Pop $1
  Pop $0
!macroend

!macro snhReportDirectoryFailure
  ${If} $snhRestoreError != 0
    StrCpy $snhRecoveryStopped "1"
  ${EndIf}
  !ifmacrodef customInstallerDirectoryFailed
    !insertmacro customInstallerDirectoryFailed
  !else
    DetailPrint "Directory operation failed ($snhDirectoryError): $snhDirectorySource -> $snhDirectoryDestination; restore error: $snhRestoreError"
  !endif
!macroend

!macro snhExtractPayload FILE
  !ifmacrodef customInstallerExtract
    !insertmacro customInstallerExtract "${FILE}"
  !else
    nsExec::ExecToStack '"$PLUGINSDIR\snh-7za.exe" x -y -bd -bb0 "-o$INSTDIR" "${FILE}"'
    Pop $R0
    Pop $R1
  !endif
  ${If} $R0 != 0
    DetailPrint $R1
    Call snhRollbackDirectories
    !ifmacrodef customInstallerExtractFailed
      !insertmacro customInstallerExtractFailed "${FILE}"
    !else
      MessageBox MB_OK|MB_ICONEXCLAMATION "$(decompressionFailed)" /SD IDOK
    !endif
    SetErrorLevel 2
    Quit
  ${EndIf}
!macroend

!macro snhStageApplication
  !ifdef SNH_INSTALLER_LOG_DIR
    ; electron-builder defines the cache name after including our function bodies, before this section expands.
    StrCpy $snhDirectoryLogDirectory "${SNH_INSTALLER_LOG_DIR}"
  !endif
  StrCpy $snhFinalDirectory $INSTDIR
  System::Call 'ole32::CoCreateGuid(g .r0) i .r1'
  ${If} $1 != 0
    SetErrorLevel 2
    Quit
  ${EndIf}
  StrCpy $snhNewDirectory "$INSTDIR.new-$0"
  StrCpy $snhOldDirectory "$INSTDIR.old-$0"
  StrCpy $snhOldMoved ""
  StrCpy $snhNewMoved ""
  StrCpy $snhDirectoryError 0
  StrCpy $snhRestoreError 0
  StrCpy $snhRecoveryStopped ""
  ClearErrors
  CreateDirectory $snhNewDirectory
  ${If} ${Errors}
    SetErrorLevel 2
    Quit
  ${EndIf}
  File /oname=$PLUGINSDIR\snh-7za.exe "${SNH_SEVENZIP_PATH}"
  StrCpy $INSTDIR $snhNewDirectory
  SetOutPath $INSTDIR
  !insertmacro installApplicationFiles
  !ifdef SNH_SEVENZIP_LICENSE_DIR
    File /oname=7zip-installer-LICENSE.txt "${SNH_SEVENZIP_LICENSE_DIR}\LICENSE.txt"
    File /oname=7zip-installer-COPYING.txt "${SNH_SEVENZIP_LICENSE_DIR}\COPYING"
  !endif
  !ifdef UNINSTALLER_ICON
    File /oname=uninstallerIcon.ico "${UNINSTALLER_ICON}"
  !endif
  StrCpy $INSTDIR $snhFinalDirectory
  SetOutPath $PLUGINSDIR
!macroend

Function .onGUIEnd
  Call snhCleanupDirectories
FunctionEnd

Function snhCleanupDirectories
  ${If} $snhRecoveryStopped == "1"
    Return
  ${EndIf}
  ${If} $snhFinalDirectory != ""
    Call snhRollbackDirectories
  ${EndIf}
FunctionEnd

; Only directories created or renamed by this installer are removed during rollback.
Function snhRollbackDirectories
  SetOutPath $PLUGINSDIR
  ${If} $snhNewMoved == "1"
    RMDir /r "\\?\$snhFinalDirectory"
    StrCpy $snhNewMoved ""
  ${EndIf}
  ${If} $snhOldMoved == "1"
    !insertmacro snhDirectoryOperation "$snhOldDirectory" "$snhFinalDirectory" $snhRestoreError "restore"
    ${If} $snhRestoreError != 0
      ; Leave the complete backup in place if another process prevents restoration.
      DetailPrint $snhOldDirectory
      RMDir /r "\\?\$snhNewDirectory"
      Return
    ${EndIf}
    StrCpy $snhOldMoved ""
  ${EndIf}
  ${If} $snhNewDirectory != ""
    RMDir /r "\\?\$snhNewDirectory"
  ${EndIf}
  StrCpy $INSTDIR $snhFinalDirectory
FunctionEnd

Function snhPromoteDirectories
  !ifmacrodef InstallerPublishStage
    !insertmacro InstallerPublishStage 2
  !endif
  ; SetOutPath opens a directory handle; release it before either rename.
  SetOutPath $PLUGINSDIR
  ClearErrors
  ${If} ${FileExists} "$snhFinalDirectory\*.*"
    StrCpy $snhDirectorySource $snhFinalDirectory
    StrCpy $snhDirectoryDestination $snhOldDirectory
    !insertmacro snhDirectoryOperation "$snhDirectorySource" "$snhDirectoryDestination" $snhDirectoryError "backup"
    ${If} $snhDirectoryError != 0
      Call snhRollbackDirectories
      !insertmacro snhReportDirectoryFailure
      SetErrors
      Return
    ${EndIf}
    StrCpy $snhOldMoved "1"
  ${Else}
    ; NSIS can create the destination before the install section starts.
    StrCpy $snhDirectorySource $snhFinalDirectory
    StrCpy $snhDirectoryDestination ""
    !insertmacro snhDirectoryOperation "$snhDirectorySource" "" $snhDirectoryError "remove-empty"
    ${If} $snhDirectoryError != 0
      Call snhRollbackDirectories
      !insertmacro snhReportDirectoryFailure
      SetErrors
      Return
    ${EndIf}
  ${EndIf}
  ClearErrors
  StrCpy $snhDirectorySource $snhNewDirectory
  StrCpy $snhDirectoryDestination $snhFinalDirectory
  !insertmacro snhDirectoryOperation "$snhDirectorySource" "$snhDirectoryDestination" $snhDirectoryError "promote"
  ${If} $snhDirectoryError != 0
    Call snhRollbackDirectories
    !insertmacro snhReportDirectoryFailure
    SetErrors
    Return
  ${EndIf}
  StrCpy $snhNewMoved "1"
  SetOutPath $snhFinalDirectory
  !ifmacrodef InstallerPublishStage
    !insertmacro InstallerPublishStage 3
  !endif
  ClearErrors
FunctionEnd

!macro snhFinishDirectories
  StrCpy $snhNewMoved ""
  ${If} $snhOldMoved == "1"
    RMDir /r "\\?\$snhOldDirectory"
    StrCpy $snhOldMoved ""
  ${EndIf}
!macroend
