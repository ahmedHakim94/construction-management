import { useState, type MouseEvent } from "react";
import { Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import {
  FileDownloadOutlined,
  KeyboardArrowDown,
  TableChartOutlined,
  PictureAsPdfOutlined,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { AppButton } from "@/components/ui";

export interface ExportButtonMenuProps {
  onExportExcel: () => Promise<void> | void;
  onExportPdf: () => Promise<void> | void;
  disabled?: boolean;
}

export function ExportButtonMenu({
  onExportExcel,
  onExportPdf,
  disabled = false,
}: ExportButtonMenuProps) {
  const { t } = useTranslation(["reports"]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [exporting, setExporting] = useState(false);

  const isOpen = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExport = async (action: () => Promise<void> | void) => {
    handleClose();
    setExporting(true);
    try {
      await action();
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <AppButton
        variant="outlined"
        size="small"
        disabled={disabled || exporting}
        loading={exporting}
        startIcon={<FileDownloadOutlined fontSize="small" />}
        endIcon={<KeyboardArrowDown fontSize="small" />}
        onClick={handleClick}
        sx={{
          fontWeight: 600,
          textTransform: "none",
          px: 1.75,
          py: 0.6,
          borderColor: "divider",
          color: "text.primary",
          "&:hover": {
            borderColor: "primary.main",
            backgroundColor: "action.hover",
          },
        }}
      >
        {t("reports:export")}
      </AppButton>

      <Menu
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{
          paper: {
            sx: {
              mt: 0.5,
              minWidth: 190,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
            },
          },
        }}
      >
        <MenuItem
          onClick={() => handleExport(onExportExcel)}
          sx={{ py: 1, gap: 1 }}
        >
          <ListItemIcon sx={{ minWidth: 28, color: "success.main" }}>
            <TableChartOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={t("reports:exportExcel")}
            primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: 500 }}
          />
        </MenuItem>

        <MenuItem
          onClick={() => handleExport(onExportPdf)}
          sx={{ py: 1, gap: 1 }}
        >
          <ListItemIcon sx={{ minWidth: 28, color: "error.main" }}>
            <PictureAsPdfOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={t("reports:exportPdf")}
            primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: 500 }}
          />
        </MenuItem>
      </Menu>
    </>
  );
}
