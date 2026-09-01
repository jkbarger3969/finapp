import { useState } from "react";
import { Box, Container, Step, StepLabel, Stepper, Typography } from "@mui/material";

import ConnectStep from "./steps/ConnectStep";
import DetectSchemaStep from "./steps/DetectSchemaStep";
import MapReferenceStep from "./steps/MapReferenceStep";
import SyncBudgetsStep from "./steps/SyncBudgetsStep";
import SyncEntriesStep from "./steps/SyncEntriesStep";
import SummaryStep from "./steps/SummaryStep";
import { SyncEntriesResponse } from "../shared/ipcTypes";

const STEP_LABELS = [
  "Connect: Old Server",
  "Connect: New Server",
  "Detect Schema",
  "Map References",
  "Sync Budgets",
  "Sync Entries",
  "Done",
];

export default function App() {
  const [step, setStep] = useState(0);
  const [unwrapLegacyNodeIdRefs, setUnwrapLegacyNodeIdRefs] = useState<
    { idKey: "id" | "node" } | undefined
  >(undefined);
  const [entriesResult, setEntriesResult] = useState<SyncEntriesResponse | null>(null);

  const next = () => setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 1 }}>
        FinApp Sync Assistant
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Moves transactions from the old server to the new one for the fiscal-year cutover -
        every step below shows a dry run before anything is written.
      </Typography>

      <Stepper activeStep={step} alternativeLabel sx={{ mb: 4 }}>
        {STEP_LABELS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box>
        {step === 0 && (
          <ConnectStep
            side="old"
            title="Connect to the OLD server"
            defaultLocalPort={27101}
            onConnected={next}
          />
        )}
        {step === 1 && (
          <ConnectStep
            side="new"
            title="Connect to the NEW server"
            defaultLocalPort={27102}
            onConnected={next}
            onBack={back}
          />
        )}
        {step === 2 && (
          <DetectSchemaStep
            unwrapLegacyNodeIdRefs={unwrapLegacyNodeIdRefs}
            onUnwrapChange={setUnwrapLegacyNodeIdRefs}
            onNext={next}
            onBack={back}
          />
        )}
        {step === 3 && <MapReferenceStep onNext={next} onBack={back} />}
        {step === 4 && <SyncBudgetsStep onNext={next} onBack={back} />}
        {step === 5 && (
          <SyncEntriesStep
            unwrapLegacyNodeIdRefs={unwrapLegacyNodeIdRefs}
            onNext={(result) => {
              setEntriesResult(result);
              next();
            }}
            onBack={back}
          />
        )}
        {step === 6 && <SummaryStep entriesResult={entriesResult} onRunAgain={() => setStep(5)} />}
      </Box>
    </Container>
  );
}
