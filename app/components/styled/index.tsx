import { LoadingButton, LoadingButtonProps } from "@mui/lab";
import {
  Box,
  BoxProps,
  DialogContent,
  DialogContentProps,
  Divider,
  DividerProps,
  Skeleton,
  SkeletonProps,
} from "@mui/material";
import { styled } from "@mui/material/styles";

export const ThickDivider = styled(Divider)<DividerProps>(({ theme }) => ({
  width: "100%",
  borderBottomWidth: 5,
}));

export const FullWidthSkeleton = styled(Skeleton)<SkeletonProps>(
  ({ theme }) => ({
    width: "100%",
    height: "64px",
  })
);

export const ExtraLargeLoadingButton = styled(
  LoadingButton
)<LoadingButtonProps>(({ theme, variant }) => ({
  fontSize: "24px",
  fontWeight: 700,
  borderRadius: "78px",
  padding: "24px 78px",
  ...(variant === "outlined" && {
    boxShadow: "inset 0px 0px 0px 5px",
    "&:hover": {
      boxShadow: "inset 0px 0px 0px 5px",
    },
  }),
})) as typeof LoadingButton;

export const LargeLoadingButton = styled(LoadingButton)<LoadingButtonProps>(
  ({ theme, variant }) => ({
    fontSize: "18px",
    fontWeight: 700,
    borderRadius: "78px",
    padding: "14px 48px",
    ...(variant === "outlined" && {
      boxShadow: "inset 0px 0px 0px 5px",
      "&:hover": {
        boxShadow: "inset 0px 0px 0px 5px",
      },
    }),
  })
) as typeof LoadingButton;

export const MediumLoadingButton = styled(LoadingButton)<LoadingButtonProps>(
  ({ theme, variant }) => ({
    fontSize: "14px",
    fontWeight: 700,
    borderRadius: "24px",
    padding: "8px 18px",
    ...(variant === "outlined" && {
      boxShadow: "inset 0px 0px 0px 3px",
      "&:hover": {
        boxShadow: "inset 0px 0px 0px 3px",
      },
    }),
  })
) as typeof LoadingButton;

export const CardBox = styled(Box)<BoxProps>(({ theme }) => ({
  width: "100%",
  background: "#FFFFFF",
  borderRadius: "12px",
  padding: "22px 36px",
}));

export const DialogCenterContent = styled(DialogContent)<DialogContentProps>(
  ({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    margin: "14px 0px",
  })
);
