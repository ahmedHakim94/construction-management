import { useRef, useState, type MouseEvent } from "react";
import { Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import FileDownloadOutlined from "@mui/icons-material/FileDownloadOutlined";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import TableChartOutlined from "@mui/icons-material/TableChartOutlined";
import PictureAsPdfOutlined from "@mui/icons-material/PictureAsPdfOutlined";
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
  const [isExporting, setIsExporting] = useState(false);
  const isExportingRef = useRef(false);

  const isOpen = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (disabled || isExportingRef.current) return;
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleExport = async (action: () => Promise<void> | void) => {
    if (disabled || isExportingRef.current) return;
    isExportingRef.current = true;
    handleClose();
    setIsExporting(true);
    try {
      await action();
    } finally {
      isExportingRef.current = false;
      setIsExporting(false);
    }
  };

  return (
    <>
      <AppButton
        variant="outlined"
        size="small"
        disabled={disabled || isExporting}
        loading={isExporting}
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
          disabled={disabled || isExporting}
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
          disabled={disabled || isExporting}
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
