from __future__ import annotations

import atexit
import os
import tempfile


_data_dir = tempfile.TemporaryDirectory(prefix="tdm-headless-tests-")
atexit.register(_data_dir.cleanup)
os.environ.setdefault("TDM_DATA_DIR", _data_dir.name)
