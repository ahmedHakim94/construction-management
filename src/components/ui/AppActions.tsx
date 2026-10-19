import { Stack, IconButton, Tooltip } from "@mui/material";
import {
  EditOutlined,
  DeleteOutlined,
  VisibilityOutlined,
  LinkOffOutlined,
  CheckCircleOutline,
  BlockOutlined,
} from "@mui/icons-material";

interface AppActionsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  viewTooltip?: string;
  editTooltip?: string;
  deleteTooltip?: string;
  onUnlink?: () => void;
  unlinkTooltip?: string;
  onActivate?: () => void;
  onDeactivate?: () => void;
  activateTooltip?: string;
  deactivateTooltip?: string;
}

export function AppActions({
  onView,
  onEdit,
  onDelete,
  onUnlink,
  onActivate,
  onDeactivate,
  viewTooltip = "View",
  editTooltip = "Edit",
  deleteTooltip = "Delete",
  unlinkTooltip = "Unlink",
  activateTooltip = "Activate",
  deactivateTooltip = "Deactivate",
}: AppActionsProps) {
  return (
    <Stack
      direction="row"
      spacing={0.5}
      justifyContent="center"
      alignItems="center"
    >
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

      {onUnlink && (
        <Tooltip title={unlinkTooltip}>
          <IconButton
            size="small"
            onClick={onUnlink}
            sx={{
              color: "warning.main",
              p: 0.75,
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            <LinkOffOutlined sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      )}

      {onActivate && (
        <Tooltip title={activateTooltip}>
          <IconButton
            size="small"
            onClick={onActivate}
            sx={{ color: "success.main", p: 0.75 }}
          >
            <CheckCircleOutline sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      )}

      {onDeactivate && (
        <Tooltip title={deactivateTooltip}>
          <IconButton
            size="small"
            onClick={onDeactivate}
            sx={{ color: "error.main", p: 0.75 }}
          >
            <BlockOutlined sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );
}
