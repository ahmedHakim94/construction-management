import { Stack, IconButton, Tooltip } from "@mui/material";
import {
  EditOutlined,
  DeleteOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";

interface AppActionsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  viewTooltip?: string;
  editTooltip?: string;
  deleteTooltip?: string;
}

export function AppActions({
  onView,
  onEdit,
  onDelete,
  viewTooltip = "View",
  editTooltip = "Edit",
  deleteTooltip = "Delete",
}: AppActionsProps) {
  return (
    <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
      {onView && (
        <Tooltip title={viewTooltip}>
          <IconButton
            size="small"
            onClick={onView}
            sx={{
              color: "text.secondary",
              p: 0.75,
              "&:hover": {
                color: "primary.main",
                bgcolor: "action.hover",
              },
            }}
          >
            <VisibilityOutlined sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      )}

      {onEdit && (
        <Tooltip title={editTooltip}>
          <IconButton
            size="small"
            onClick={onEdit}
            sx={{
              color: "text.secondary",
              p: 0.75,
              "&:hover": {
                color: "secondary.main",
                bgcolor: "action.hover",
              },
            }}
          >
            <EditOutlined sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      )}

      {onDelete && (
        <Tooltip title={deleteTooltip}>
          <IconButton
            size="small"
            onClick={onDelete}
            sx={{
              color: "error.main",
              p: 0.75,
              "&:hover": {
                bgcolor: "error.light",
              },
            }}
          >
            <DeleteOutlined sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );
}