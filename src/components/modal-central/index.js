import React from "react";
import { Modal, Box, Typography, Grow, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Lines from "../lines";
import Label from "../label";

const CentralModal = ({
  open,
  onClose,
  bottom,
  title,
  children,
  icon,
  width,
  top,
  left,
  maxHeight,
  tamanhoTitulo,
}) => {
  return (
    <Modal
      style={{ padding: 20 }}
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropProps={{
        timeout: 500,
      }}
      aria-labelledby="central-modal-title"
      aria-describedby="central-modal-description"
    >
      <Grow in={open} style={{ transformOrigin: "top center" }}>
        <Box
          sx={{
            position: "absolute",
            top: { xs: "10%", sm: "20%", md: "15%", lg: top || "15%" },
            left: { xs: "5%", sm: "15%", md: "15%", lg: left || "20%" },
            bottom: { bottom },
            maxHeight: maxHeight,
            overflowY: "auto",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: "70%", md: "50%", lg: width || "450px" },
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 3,
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
              gap: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                flex: 1,
                minWidth: 0,
              }}
            >
              {icon && (
                <Box
                  sx={{
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#9D4B5B",
                    borderRadius: "5px",
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  {icon}
                </Box>
              )}
              <Typography
                id="central-modal-title"
                variant="h6"
                component="h2"
                sx={{
                  fontWeight: 700,
                  fontSize: "15px",
                  width: tamanhoTitulo || "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                }}
              >
                {title}
              </Typography>
            </Box>
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                color: "#666",
                flexShrink: 0,
                "&:hover": {
                  color: "#9D4B5B",
                  backgroundColor: "rgba(157, 75, 91, 0.1)",
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Conteúdo do modal */}
          <Typography id="central-modal-description" sx={{ mb: 2 }}>
            {children}
          </Typography>
        </Box>
      </Grow>
    </Modal>
  );
};

export default CentralModal;
