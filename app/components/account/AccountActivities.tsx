import { Box, Stack, SxProps, Typography } from "@mui/material";
import { orange } from "@mui/material/colors";
import EntityList from "../entity/EntityList";
import { CardBox, MediumLoadingButton } from "../styled";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";

/**
 * A component with account activities.
 */
export default function AccountActivities(props: {
  address: `0x${string}`;
  sx?: SxProps;
}) {
  /**
   * TODO:
   *
   * 1. Load ids of activities from contract using moralis (https://docs.moralis.io/web3-data-api/evm/reference/get-wallet-nfts)
   * 3. Load activity params, check-ins, heatmap by id
   * 2. Calculate heatmap by activity check-ins
   */

  return (
    <>
      <EntityList
        entities={[]}
        renderEntityCard={({}, index) => <AccountActivityCard key={index} />}
        noEntitiesText="😐 no activities"
        sx={{ mt: 4 }}
      />
      <AccountActivityCardFake />
    </>
  );
}

function AccountActivityCard(props: {}) {
  return <CardBox>...</CardBox>;
}

function AccountActivityCardFake() {
  return (
    <CardBox sx={{ mt: 2 }}>
      <Typography variant="h6" fontWeight={700}>
        🙌 Helping beginner developers
      </Typography>
      <Stack direction="row" spacing={1} mt={1}>
        <Typography color={orange[500]} fontWeight={700}>
          42
        </Typography>
        <Typography>check-ins this month</Typography>
      </Stack>
      <Stack direction="row" spacing={1} mt={0.5}>
        <Typography color={orange[500]} fontWeight={700}>
          Everyone
        </Typography>
        <Typography>can check in this activity</Typography>
      </Stack>
      <Stack direction="row" spacing={2} mt={1}>
        <MediumLoadingButton variant="contained">
          ✅ Check In
        </MediumLoadingButton>
        <MediumLoadingButton variant="outlined">📢 Share</MediumLoadingButton>
      </Stack>
      <Box sx={{ my: 4 }}>
        <CalendarHeatmap
          startDate={new Date("2023-06-01")}
          endDate={new Date("2023-08-31")}
          values={[
            { date: "2023-08-08", count: 12 },
            { date: "2023-08-09", count: 38 },
          ]}
          titleForValue={(value) => `Date is ${JSON.stringify(value)}`}
        />
      </Box>
      <Stack direction="row" spacing={1} mt={1} alignItems="center">
        <MediumLoadingButton
          variant="contained"
          sx={{
            background: orange[500],
            "&:hover": {
              background: orange[300],
            },
          }}
        >
          🤘 It’s inspiring!
        </MediumLoadingButton>
        <Typography variant="h6" color={orange[500]} fontWeight={700}>
          7
        </Typography>
      </Stack>
      <Stack direction="row" spacing={1} mt={1} alignItems="center">
        <MediumLoadingButton
          variant="outlined"
          sx={{
            color: orange[500],
            borderColor: orange[500],
            "&:hover": {
              color: orange[300],
              borderColor: orange[300],
            },
          }}
        >
          🤯 You are crazy!
        </MediumLoadingButton>
        <Typography variant="h6" color={orange[500]} fontWeight={700}>
          19
        </Typography>
      </Stack>
    </CardBox>
  );
}
