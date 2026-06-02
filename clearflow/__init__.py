"""ClearFlow - AI Automation core workflow engine for ClearGlassInc.

Copyright (c) 2025-2030 Clearglassinc. All Rights Reserved.

ClearFlow runs the daily operating model with a single, enforced discipline:
advance exactly ONE keystone outcome (the day's P0) and let it *unlock* every
other domain behind it. It ingests a Strategic Priority Matrix, the morning
pledge (three commitments), and the Critical Intelligence Brief, then drives the
keystone to ``DONE`` - the event that opens the rest of the day.

Layering mirrors the sibling ``clearpulse`` package:

* :mod:`clearflow.models`     - the data layer (matrix rows, pledges, signals).
* :mod:`clearflow.matrix`     - build/ seed the Strategic Priority Matrix.
* :mod:`clearflow.engine`     - the logic layer (gating, scheduling, pledges).
* :mod:`clearflow.intel`      - route the Critical Intelligence Brief.
* :mod:`clearflow.workflow`   - the orchestrator (the core workflow module).
* :mod:`clearflow.bot`        - the operator-facing Daily Outcome Bot.

The engine depends only on the standard library so it can be exercised without
any optional service present.
"""

__version__ = "0.1.0"
__copyright__ = "(c) 2025-2030 Clearglassinc. All Rights Reserved."
__system_name__ = "ClearFlow AI Automation Workflow Engine"

from clearflow.models import (
    IntelSignal,
    Pledge,
    PledgeOutcome,
    Priority,
    Status,
    TimeBlock,
    WorkItem,
    new_trace_id,
)
from clearflow.workflow import AutomationWorkflow, WorkflowError

__all__ = [
    "AutomationWorkflow",
    "WorkflowError",
    "IntelSignal",
    "Pledge",
    "PledgeOutcome",
    "Priority",
    "Status",
    "TimeBlock",
    "WorkItem",
    "new_trace_id",
    "__version__",
]
