import * as React from "react";
import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import { visuallyHidden } from "@mui/utils";
import { ReactNode } from "react";
import { Card, CardActions, CardContent, CardHeader, CardMedia, FormControl, Grid, InputLabel, MenuItem, OutlinedInput, Select } from "@mui/material";
import TableIcon from "@mui/icons-material/TableChart";
import GridIcon from "@mui/icons-material/GridOn";
import get from "lodash/get";
import SortIcon from '@mui/icons-material/Sort';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
interface Id {
    id: string;
}

interface Definition<T> {
    key: keyof T;
    label: string;
    render?: (item: T) => ReactNode;
}

interface Action<T> {
    label: string;
    onClick?: (item: T) => void;
    icon?: ReactNode;
    children?: (item: T) => ReactNode;
    colorType?:
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "info"
    | "inherit"
    | "error"
    | undefined;
}

type Order = "asc" | "desc";

interface DataViewProps<T extends Id> {
    data?: T[];
    definition: Definition<T>[];
    total?: number;
    onPageChange?: (page: number) => void;
    onRowsPerPageChange?: (rowsPerPage: number) => void;
    page?: number;
    rowsPerPage?: number;
    action?: Action<T>[];
    showActionLabel?: boolean;
    cardRenderMap?: {
        title: string;
        subtitle?: string;
        image?: string;
        description?: string;
    },
    handleSortChange?: (sort: string) => void;
    handleOrderChange?: (order: Order) => void;

    filterSelect?: {
        label: string;
        key: string;
        options: {
            label: string;
            value: string;
        }[]
    }[]
}

enum ViewType {
    Table,
    Grid,
}
interface EnhancedTableProps<T> {
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof T) => void;
    order: Order;
    orderBy: string;
    rowCount: number;
    definition: Definition<T>[];
    action?: Action<T>[];
}

function EnhancedTableHead<T>({
    order,
    orderBy,
    rowCount,
    onRequestSort,
    definition,
    action,
}: EnhancedTableProps<T>) {
    const createSortHandler =
        (property: keyof T) => (event: React.MouseEvent<unknown>) => {
            onRequestSort(event, property);
        };

    return (
        <TableHead
            sx={{
                backgroundColor: (theme) => theme.palette.primary.main,
                color: (theme) => theme.palette.primary.contrastText,
                borderRadius: "6px",

            }}
        >
            <TableRow>
                {definition.map((d) => (
                    <TableCell
                        key={`${String(d.key)}-${d.label}`}
                        sortDirection={orderBy === d.key ? order : false}
                    >
                        <TableSortLabel
                            active={orderBy === d.key}
                            direction={orderBy === d.key ? order : "asc"}
                            onClick={createSortHandler(d.key)}
                        >
                            {d.label}
                            {orderBy === d.key ? (
                                <Box component="span" sx={visuallyHidden}>
                                    {order === "desc" ? "sorted descending" : "sorted ascending"}
                                </Box>
                            ) : null}
                        </TableSortLabel>
                    </TableCell>
                ))}
                {action?.length &&
                    <TableCell
                    >
                        <Typography textAlign={"center"} fontWeight="bold">
                            Aksi
                        </Typography>
                    </TableCell>}
            </TableRow>
        </TableHead>
    );
}

interface EnhancedTableToolbarProps {
    numSelected: number;
}

const EnhancedTableToolbar = (props: EnhancedTableToolbarProps) => {
    const { numSelected } = props;

    return (
        <Toolbar
            sx={{
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
                ...(numSelected > 0 && {
                    bgcolor: (theme) =>
                        alpha(
                            theme.palette.primary.main,
                            theme.palette.action.activatedOpacity
                        ),
                }),
            }}
        >
            {numSelected > 0 ? (
                <Typography
                    sx={{ flex: "1 1 100%" }}
                    color="inherit"
                    variant="subtitle1"
                    component="div"
                >
                    {numSelected} selected
                </Typography>
            ) : (
                <Typography
                    sx={{ flex: "1 1 100%" }}
                    variant="h6"
                    id="tableTitle"
                    component="div"
                >
                    Nutrition
                </Typography>
            )}
            {numSelected > 0 ? (
                <Tooltip title="Delete">
                    <IconButton>
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
            ) : (
                <Tooltip title="Filter list">
                    <IconButton>
                        <FilterListIcon />
                    </IconButton>
                </Tooltip>
            )}
        </Toolbar>
    );
};




export default function DataView<T extends Id>({
    definition,
    data,
    total,
    page,
    rowsPerPage,
    onPageChange,
    action,
    onRowsPerPageChange,
    showActionLabel,
    cardRenderMap,
    handleOrderChange,
    handleSortChange,

}: DataViewProps<T>) {
    const [viewType, setViewType] = React.useState<ViewType>(ViewType.Table);

    const [order, setOrder] = React.useState<Order>("asc");
    const [orderBy, setOrderBy] = React.useState<keyof T>("id");

    const handleRequestSort = (
        event: React.MouseEvent<unknown>,
        property: keyof T
    ) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        onPageChange && onPageChange(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        onRowsPerPageChange &&
            onRowsPerPageChange(parseInt(event.target.value, 10));
        onPageChange && onPageChange(0);
    };

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows = data != null ? 0 : rowsPerPage ?? 10;
    const layoutHeight = emptyRows * 53 + 53;
    const renderMapCast = cardRenderMap as Record<string, string>;
    return (
        <Box
            sx={{
                width: "100%",
                minHeight: "70vh",
            }}
        >
            {/* <EnhancedTableToolbar numSelected={selected.length} /> */}
            <Paper sx={{
                mb: 2,
                p: 2
            }}>
                <Box sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}>
                    <Box sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2

                    }}>
                        <Button
                            onClick={() => {
                                handleOrderChange && handleOrderChange(
                                    order === "asc" ? "desc" : "asc"
                                );
                                setOrder(order === "asc" ? "desc" : "asc");
                            }}
                        >
                            <SortIcon />

                            {
                                order === "asc" ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />
                            }
                        </Button>
                        <FormControl sx={{ m: 1, width: 200 }}>
                            <InputLabel id="fields">Urutkan dari</InputLabel>
                            <Select<string>
                                labelId="fields"
                                id="orderby-fields"
                                onChange={(e) => {
                                    handleSortChange && handleSortChange(e.target.value as string);

                                    setOrderBy(e.target.value as keyof T);

                                }}
                                input={<OutlinedInput label="Name" />}
                                MenuProps={{
                                    PaperProps: {
                                        style: {
                                            width: 250,
                                        },
                                    },
                                }}
                            >
                                {['id', 'createdAt', 'updatedAt'].map((name) => (
                                    <MenuItem
                                        key={name}
                                        value={name}
                                    >
                                        {name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                    </Box>
                    <Box sx={{
                        display: "flex",
                        gap: 1,
                    }}>
                        {[
                            {
                                label: "Kartu",
                                icon: <GridIcon />,
                                type: ViewType.Grid,
                            },
                            {
                                label: "Tabel",
                                icon: <TableIcon />,
                                type: ViewType.Table,
                            },


                        ].map(e =>
                            <Button
                                key={e.label}
                                variant={viewType === e.type ? "contained" : "outlined"}
                                onClick={() => setViewType(e.type)}
                            >
                                {e.icon}
                            </Button>)}

                    </Box>
                </Box>
            </Paper>
            {data?.length === 0 && <Box sx={{ height: layoutHeight }} />}
            {viewType === ViewType.Grid && <Grid container spacing={1}>
                {data?.map(item => (<Grid item xs={12} sm={6} md={4} lg={3} key={`${item.id}`}>
                    <Card>
                        <CardHeader
                            title={get(item, renderMapCast?.title ?? "name") ?? ""}
                            subheader={get(item, renderMapCast?.subtitle ?? "id") ?? ""}
                        />
                        {renderMapCast?.image && <CardMedia
                            component="img"
                            height="194"
                            image={get(item, renderMapCast?.image ?? "image") ?? ""}
                            alt={get(item, renderMapCast?.title ?? "name") ?? ""}
                        />}
                        <CardContent>
                            <Typography variant="body2" color="text.secondary">
                                {get(item, renderMapCast?.description ?? "description") ?? ""}
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Box sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: "10px",
                                width: "100%",
                            }}>
                                {action?.map((d) => (
                                    <React.Fragment key={d.label}>
                                        {(d.children && d.children(item)) ?? (
                                            showActionLabel ? <Button
                                                onClick={() => {
                                                    d.onClick && d.onClick(item);
                                                }}
                                                startIcon={d.icon}
                                                color={d.colorType}
                                            >
                                                {d.label}
                                            </Button> :
                                                <IconButton
                                                    onClick={() => {
                                                        d.onClick && d.onClick(item);
                                                    }
                                                    }
                                                    color={d.colorType}
                                                >
                                                    {d.icon}
                                                </IconButton>

                                        )}
                                    </React.Fragment>

                                ))}
                            </Box>
                        </CardActions>
                    </Card>
                </Grid>))}
            </Grid>}
            {viewType == ViewType.Table && <TableContainer
                sx={{
                    height: "100%",
                }}
                component={Paper}
            >
                <Table
                    sx={{ minWidth: 750 }}
                    aria-labelledby="tableTitle"
                    size={"medium"}
                >
                    <EnhancedTableHead
                        order={order}
                        orderBy={String(orderBy)}
                        onRequestSort={handleRequestSort}
                        rowCount={data?.length || 0}
                        definition={definition}
                        action={action}
                    />
                    <TableBody>
                        {data?.map((row, index) => {
                            const labelId = `enhanced-table-checkbox-${index}`;

                            return (
                                <TableRow
                                    hover
                                    role="checkbox"
                                    tabIndex={-1}
                                    key={String(row.id


                                    )}
                                >
                                    {definition.map((d, i) => (
                                        <TableCell sx={{
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            backgroundColor: (theme) => theme.palette.background.paper,
                                        }} key={d.key as string} id={labelId} align="left">
                                            {d.render ? d.render(row) : String(row[d.key])}
                                        </TableCell>
                                    ))}
                                    <TableCell
                                        id={labelId}
                                        align="left"
                                        sx={{
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            backgroundColor: (theme) => theme.palette.background.paper,
                                        }}
                                    >
                                        <Box sx={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            gap: "10px",
                                        }}>
                                            {action?.map((d) => (
                                                <React.Fragment key={d.label}>
                                                    {(d.children && d.children(row)) ?? (
                                                        showActionLabel ? <Button
                                                            onClick={() => {
                                                                d.onClick && d.onClick(row);
                                                            }}
                                                            startIcon={d.icon}
                                                            color={d.colorType}
                                                        >
                                                            {d.label}
                                                        </Button> :
                                                            <IconButton
                                                                onClick={() => {
                                                                    d.onClick && d.onClick(row);
                                                                }
                                                                }
                                                                color={d.colorType}
                                                            >
                                                                {d.icon}
                                                            </IconButton>

                                                    )}
                                                </React.Fragment>

                                            ))}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {emptyRows > 0 && (
                            <TableRow
                                style={{
                                    height: 53 * emptyRows,
                                }}
                            >
                                <TableCell colSpan={6} />
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>}


            <Paper sx={{ mt: 2 }}>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 15]}
                    component="div"
                    count={total ?? data?.length ?? 0}
                    rowsPerPage={rowsPerPage ?? 5}
                    page={page ?? 0}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Box>
    );
}
