import * as React from "react";
import Divider from "@mui/material/Divider";
import Drawer, { DrawerProps } from "@mui/material/Drawer";
import List from "@mui/material/List";
import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import DnsRoundedIcon from "@mui/icons-material/DnsRounded";
import PermMediaOutlinedIcon from "@mui/icons-material/PhotoSizeSelectActual";
import PublicIcon from "@mui/icons-material/Public";
import SettingsEthernetIcon from "@mui/icons-material/SettingsEthernet";
import SettingsInputComponentIcon from "@mui/icons-material/SettingsInputComponent";
import TimerIcon from "@mui/icons-material/Timer";
import SettingsIcon from "@mui/icons-material/Settings";
import PhonelinkSetupIcon from "@mui/icons-material/PhonelinkSetup";
import { useRouter } from "next/router";
import {
  CalendarMonth,
  Comment,
  ContentCopy,
  DataArray,
  Description,
  Favorite,
  Place,
  PlayCircleFilled,
} from "@mui/icons-material";
import People from "@mui/icons-material/People";
import { FormControl } from "@mui/material";

const categories = [
  {
    id: "Analitik",
    children: [
      {
        id: "Data",
        icon: <DataArray />,
        path: "/admin/data",
      },
    ],
  },
  {
    id: "Konten",
    children: [
      {
        id: "Tempat Wisata",
        icon: <Place />,
        path: "/admin/places",
      },
      {
        id: "Acara",
        icon: <CalendarMonth />,
        path: "/admin/events",
      },
      { id: "Media", icon: <ContentCopy />, path: "/admin/media" },
    ],
  },
  {
    id: "Pengguna",
    children: [
      { id: "Pengguna", icon: <People />, path: "/admin/users" },
      { id: "Proposal", icon: <Description />, path: "/admin/proposals" },
      { id: "Favorit", icon: <Favorite />, path: "/admin/favorites" },
      { id: "Komentar", icon: <Comment />, path: "/admin/comments" },
      {
        id: "Kunjungan",
        icon: <PlayCircleFilled />,
        path: "/admin/participations",
      },
    ],
  },
  {
    id: "Proposal",
    children: [
      {
        id: "Tempat",
        icon: <Description />,
        path: "https://docs.google.com/spreadsheets/d/1jl9rfMnbj4G5Kj2cVc4RPOR7dBFBKfGa8dLzC5-3xZU/edit?resourcekey=undefined&usp=forms_web_b#gid=45988571",
      },
      {
        id: "Event",
        icon: <Description />,
        path: "https://docs.google.com/spreadsheets/d/1fT8nbgh4GZodasEuPUTxR-yzU7SSHlf_KrxQZ5Yu5Hs/edit?usp=sharing",
      },
    ],
  },
];

const item = {
  py: "2px",
  px: 3,
  color: "rgba(255, 255, 255, 0.7)",
  "&:hover, &:focus": {
    bgcolor: "rgba(255, 255, 255, 0.08)",
  },
};

const itemCategory = {
  boxShadow: "0 -1px 0 rgb(255,255,255,0.1) inset",
  py: 1.5,
  px: 3,
};

export default function Navigator(props: DrawerProps) {
  const { ...other } = props;
  const { pathname, push } = useRouter();
  const checkActive = (e: string) => (pathname == e ? true : false);

  return (
    <Drawer variant="permanent" {...other}>
      <List disablePadding>
        <ListItem
          sx={{ ...item, ...itemCategory, fontSize: 22, color: "#fff" }}
        >
          Kedaireka VR
        </ListItem>
        <ListItem sx={{ ...item, ...itemCategory }}>
          <ListItemButton
            selected={checkActive("/admin/data")}
            sx={item}
            onClick={() => {
              push("/admin/data");
            }}
          >
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText>Dashboard</ListItemText>
          </ListItemButton>
        </ListItem>
        {categories.map(({ id, children }) => (
          <Box key={id} sx={{ bgcolor: "#101F33" }}>
            <ListItem sx={{ py: 2, px: 3 }}>
              <ListItemText sx={{ color: "#fff" }}>{id}</ListItemText>
            </ListItem>
            {children.map(({ id: childId, icon, path }) => (
              <ListItem disablePadding key={childId}>
                <ListItemButton
                  selected={checkActive(childId)}
                  sx={item}
                  onClick={() => {
                    push(path);
                  }}
                >
                  <ListItemIcon>{icon}</ListItemIcon>
                  <ListItemText>{childId}</ListItemText>
                </ListItemButton>
              </ListItem>
            ))}
            <Divider sx={{ mt: 2 }} />
          </Box>
        ))}
      </List>
    </Drawer>
  );
}
