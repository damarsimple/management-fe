import { Copyright } from '@mui/icons-material'
import { Container, Grid, Paper, Link } from '@mui/material'
import DashboardLayout from 'components/DashboardLayout'
import React from 'react'
import Table from '@mui/material/Table';
import { useTheme } from '@mui/material/styles';
import { LineChart, Line, XAxis, YAxis, Label, ResponsiveContainer } from 'recharts';
import Typography from '@mui/material/Typography';
import NextLink from 'next/link';
import BrowserOnly from 'components/BrowserOnly';

export default function Index() {
  const theme = useTheme();

  return (
    <DashboardLayout headerName='Dashboard'>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8} lg={9}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 240,
              }}
            >
              <BrowserOnly>
                <Title>Perkembangan pengguna</Title>
                <ResponsiveContainer>
                  <LineChart
                    data={[]}
                    margin={{
                      top: 16,
                      right: 16,
                      bottom: 0,
                      left: 24,
                    }}
                  >
                    <XAxis
                      dataKey="time"
                      stroke={theme.palette.text.secondary}
                      style={theme.typography.body2}
                    />
                    <YAxis
                      stroke={theme.palette.text.secondary}
                      style={theme.typography.body2}
                    >
                      <Label
                        angle={270}
                        position="left"
                        style={{
                          textAnchor: 'middle',
                          fill: theme.palette.text.primary,
                          ...theme.typography.body1,
                        }}
                      >
                        CGM
                      </Label>
                    </YAxis>
                    <Line
                      isAnimationActive={false}
                      type="monotone"
                      dataKey="amount"
                      stroke={theme.palette.primary.main}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </BrowserOnly>
            </Paper>
          </Grid>
          {/* Recent Deposits */}
          <Grid item xs={12} md={4} lg={3}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 240,
              }}
            >
              <Title>Proposal</Title>
              <Typography component="p" variant="h4">
                10
              </Typography>
              <Typography color="text.secondary" sx={{ flex: 1 }}>
                terbaru bulan ini
              </Typography>
              <div>
                <Link color="primary" href="/admin/proposals" component={NextLink}>
                  Lihat Proposal
                </Link>
              </div>
            </Paper>
          </Grid>
        </Grid>
        <Copyright sx={{ pt: 4 }} />
      </Container>
    </DashboardLayout >
  )
}





interface TitleProps {
  children?: React.ReactNode;
}

export function Title(props: TitleProps) {
  return (
    <Typography component="h2" variant="h6" color="primary" gutterBottom>
      {props.children}
    </Typography>
  );
}

