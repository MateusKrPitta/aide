import * as React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function Acordion({ titulo, informacoes, icone }) {
  return (
    <div className="w-full">
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1-content"
          id="panel1-header"
        >
          <Typography component="span">
            <div className="flex items-center gap-5">
              <label className="text-sm flex gap-5 items-center font-bold text-primary">
                {icone}
                {titulo}
              </label>
            </div>
          </Typography>
        </AccordionSummary>
        <AccordionDetails>{informacoes}</AccordionDetails>
      </Accordion>
    </div>
  );
}
