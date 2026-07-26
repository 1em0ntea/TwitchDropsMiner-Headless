from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]


def test_core_import_does_not_load_desktop_modules(tmp_path) -> None:
    script = r"""
import builtins
import json
import sys

blocked = {"gui", "tkinter", "PIL", "pystray"}
original_import = builtins.__import__

def guarded(name, *args, **kwargs):
    if name.split(".", 1)[0] in blocked:
        raise AssertionError(f"desktop import attempted: {name}")
    return original_import(name, *args, **kwargs)

builtins.__import__ = guarded
import twitch
print(json.dumps({"gui_loaded": "gui" in sys.modules}))
"""
    env = os.environ.copy()
    env["TDM_DATA_DIR"] = str(tmp_path / "data")
    result = subprocess.run(
        [sys.executable, "-c", script],
        cwd=PROJECT_ROOT,
        env=env,
        check=True,
        capture_output=True,
        text=True,
    )
    assert json.loads(result.stdout) == {"gui_loaded": False}


def test_data_and_resource_paths_are_separate(tmp_path) -> None:
    data_dir = tmp_path / "state"
    script = (
        "import json, constants; "
        "print(json.dumps({"
        "'data': str(constants.WORKING_DIR),"
        "'resource': str(constants.RESOURCE_DIR),"
        "'settings': str(constants.SETTINGS_PATH),"
        "'lang': str(constants.LANG_PATH)"
        "}))"
    )
    env = os.environ.copy()
    env["TDM_DATA_DIR"] = str(data_dir)
    result = subprocess.run(
        [sys.executable, "-c", script],
        cwd=PROJECT_ROOT,
        env=env,
        check=True,
        capture_output=True,
        text=True,
    )
    paths = json.loads(result.stdout)
    assert Path(paths["data"]) == data_dir.resolve()
    assert Path(paths["settings"]).parent == data_dir.resolve()
    assert Path(paths["lang"]).parent == Path(paths["resource"])
