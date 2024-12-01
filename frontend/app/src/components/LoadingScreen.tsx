import { Box, Container, LinearProgress, Typography } from "@mui/material";

const LoadingScreen = () => {
  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "50vh",
        }}
      >
        <Typography variant="h6" gutterBottom>
          読み込み中です...
        </Typography>
        <LinearProgress
          sx={{
            width: "100%",
            mt: 2,
          }}
        />
      </Box>
    </Container>
  );
};

export default LoadingScreen;
