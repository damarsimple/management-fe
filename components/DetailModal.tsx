import { Box, Typography, Divider, Button } from "@mui/material";
import { ReactNode } from "react";
import { useModalStore } from "./ModalUI";

export interface DetailSection {
    title: string;
    children: {
        label: string;
        value: string | ReactNode;
    }[];
}

export default function DetailModal({ sections, children }: {
    sections: DetailSection[],
    children?: ReactNode
}) {
    const { close } = useModalStore();


    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
            }}
        >
            <Typography m={1} variant="h4" component={"h1"}>
                Detail
            </Typography>
            <Divider />
            <Box p={1}>
                {sections.map(({ title, children }, i) => (
                    <Box
                        key={i}
                        sx={{
                            py: 2,
                            display: "flex",
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                                width: "100%",
                            }}
                        >
                            <Typography variant="h4" component={"h6"}>
                                {title}
                            </Typography>
                            {children.map(({ label, value }, i) => (
                                <Box
                                    key={`${title}-${i}`}
                                    sx={{
                                        display: "flex",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: "30%",
                                            display: "flex",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                color: (theme) => theme.palette.text.secondary,
                                            }}
                                            variant="body2"
                                            component={"h6"}
                                        >
                                            {label}
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                        }}
                                    >
                                        {typeof value === "string" ? (
                                            <Typography variant="body2" component={"h6"}>
                                                {value}
                                            </Typography>
                                        ) : (
                                            value
                                        )}
                                    </Box>
                                </Box>
                            ))}
                        </Box>

                        <Divider />
                    </Box>
                ))}
            </Box>
            {children}
            <Box
                sx={{
                    height: 100,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                }}
            >
                {/* <Button variant="contained" color="primary" onClick={handleSubmit}>
                        Simpan
                    </Button> */}
                <Button onClick={close} variant="outlined" color="error">
                    Tutup
                </Button>
            </Box>

        </Box>
    );
}
