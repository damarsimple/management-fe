import { Autocomplete, Container, FormControl, FormControlLabel, Grid, IconButton, InputLabel, MenuItem, Modal, Select, Switch } from '@mui/material'
import DashboardLayout, { useTabs } from 'components/DashboardLayout'
import React, { ReactNode } from 'react'
import { useJsApiLoader } from '@react-google-maps/api';
import { DateTimePicker } from "@mui/x-date-pickers";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useModalStore } from 'components/ModalUI';
import DataView from 'components/DataView';
import DetailModal from 'components/DetailModal';
import {
    Add,
    Close,
    Delete,
    Edit,
    Info,
    PlayCircleOutline,
    PlusOne,
    Upload,
    Visibility,
    Vrpano,
} from "@mui/icons-material";
import {
    Typography,
    Box,
    Divider,
    TextField,
    Button,
    Avatar,
    Paper,
} from "@mui/material";
import { gql, useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { City, Media, Event, EventAnalytic, MediaEvent, Place } from 'type';
import usePagination from 'hooks/pagination';
import { client, httpClient } from 'constant';
import getYouTubeID from 'get-youtube-id';
import { toast } from 'react-toastify';
import useSort from 'hooks/sort';
import moment, { Moment } from 'moment';




export default function Events() {

    const { value, setValue } = useTabs();
    const {
        openWithChildren,
        close
    } = useModalStore();

    const {
        page,
        limit,
        handleLimitChange,
        handlePageChange,
    } = usePagination();
    const {
        sortBy,
        sortOrder,
        handleSortChange,
        handleSortOrderChange
    } = useSort();


    const handleFetchAnalytics = async (EventId: string) => {
        const query = gql`query EventAnalytic($EventAnalyticId: Int!) {
            eventAnalytic(id: $EventAnalyticId) {
              views
              media
              participants
            }
          }`

        const { data } = await client.query<{ EventAnalytic: EventAnalytic }>({
            query,
            variables: {
                EventAnalyticId: parseInt(EventId)
            }
        })

        return data.EventAnalytic;
    }

    const {
        data,
        refetch
    } = useQuery<{
        events: Event[];
        count: number;
    }>(gql`
    query Events($take: Int, $skip: Int, $table: Countable, $sortBy:EventFields, $sortOrder: SortOrder) {
        events(skip: $skip, take: $take, sortBy: $sortBy, sortOrder: $sortOrder) {
          id
          address
          endDate
          createdAt
          name
          startDate
          thumbnail {
            url
          }
          medias{
            id
            url
            kind
            type
          }
          place {
            id
            latitude
            longitude
            name
            city {
              id
              name
            }
            province {
              id
              name
            }
          }
        }
        count(table: $table)
      }`, {

        variables: {
            take: limit,
            skip: page * limit,
            table: "Event",
            sortBy,
            sortOrder
        }

    })

    const [editEvent, setEditEvent] = React.useState<Event | null>(null);

    const [deleteEvent] = useMutation(

        gql`
    mutation Event($id:Int!) {
        deleteEvent(id:$id) {
          id
        }
      }
    `


    )


    return (
        <DashboardLayout headerName='Acara' tabs={['List', 'Buat']}>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                {value == 1 ? <Create
                    defaultValues={editEvent}
                    back={() => {
                        setValue(0);
                        handleSortChange('id');
                        handleSortOrderChange('desc');
                        refetch({
                            take: limit,
                            skip: page * limit,
                            table: "Event",
                            sortBy: 'id',
                            sortOrder: 'desc'
                        });
                    }} /> : <>
                    <DataView<Event>
                        handleOrderChange={handleSortOrderChange}
                        handleSortChange={handleSortChange}
                        cardRenderMap={{
                            title: 'name',
                            subtitle: 'city.name',
                            image: 'thumbnail.url',
                        }}
                        definition={[
                            {
                                label: "ID",
                                key: "id",
                            },
                            {
                                label: "Nama",
                                key: "name",
                                render(item) {
                                    return <Box display="flex" gap={2} alignItems="center">
                                        <Avatar src={item.thumbnail?.url} alt={item.name} />
                                        <Typography variant="body1">{item.name}</Typography>
                                    </Box>
                                },
                            },
                            {
                                label: "Nama Tempat",
                                key: "place",
                                render(item) {
                                    return item.place.name
                                }
                            },
                            {
                                label: "Daerah tempat",
                                key: "place",
                                render(item) {
                                    return `${item.place.city?.name}, ${item.place.province?.name}`
                                }
                            },
                            {
                                label: "Mulai",
                                key: "startDate",
                                render(item) {
                                    return `${item.startDate}`
                                },
                            },
                        ]}
                        data={data?.events || []}
                        total={data?.count || 0}
                        onPageChange={(page) => {
                            handlePageChange(page);
                        }}
                        onRowsPerPageChange={(rowsPerPage) => {
                            handleLimitChange(rowsPerPage);
                        }}
                        page={page}
                        rowsPerPage={limit}
                        action={[
                            {
                                label: "Edit",
                                onClick(item) {
                                    client.query<{ event: Event }>({
                                        query: gql`query Event($eventId: Int!) {
                                            event(id: $eventId) {
                                                id
                                                name
                                                description                         
                                                medias {
                                                    id
                                                    url
                                                    type
                                                    kind
                                                    isVr
                                                }
                                            }
                                        }`,
                                        fetchPolicy: 'no-cache',
                                        variables: {
                                            EventId: parseInt(item.id)
                                        }
                                    }).then(({ data }) => {
                                        setEditEvent({
                                            // @ts-ignore
                                            provinceId: data.event.province?.id as number,
                                            // @ts-ignore
                                            cityId: data.event.city?.id as number,
                                            ...data.event,
                                        })
                                        setTimeout(() => {
                                            setValue(1);
                                        }, 300);
                                    }).catch((err) => {
                                        console.log(err)
                                        toast.error('Terjadi kesalahan saat memuat data ' + err)
                                    });
                                },
                                colorType: "warning",
                                icon: <Edit />,
                            },
                            {
                                label: "Detail",
                                colorType: "info",
                                onClick(item) {

                                    handleFetchAnalytics(item.id).then((clickedAnalytics) => {
                                        openWithChildren(
                                            <DetailModal sections={
                                                [
                                                    {
                                                        title: "Informasi Umum",
                                                        children: [{
                                                            label: "Nama",
                                                            value: item.name,
                                                        }]
                                                    },
                                                    {
                                                        title: "Analitik",
                                                        children: [
                                                            {
                                                                label: "Banyak Pengunjung Halaman",
                                                                value: clickedAnalytics?.views,
                                                            },
                                                            {
                                                                label: "Banyak Media",
                                                                value: item.medias.length,
                                                            },
                                                            {
                                                                label: "Banyak Peserta",
                                                                value: clickedAnalytics?.participants,
                                                            },
                                                        ]
                                                    },
                                                ]
                                            } >
                                                <Divider />
                                                <Box>
                                                    <Typography variant="h6" textAlign="center" sx={{ mb: 2 }}>
                                                        Media
                                                    </Typography>
                                                    <Grid container spacing={1}>
                                                        {item.medias?.map((media) => (
                                                            <Grid item xs={12} md={3} key={media.id}>
                                                                <Paper sx={{ p: 2, height: 200, display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                                    {media.type == "IMAGE" && <Button
                                                                        onClick={() => {

                                                                            // open new page 

                                                                            window.open(media.url, '_blank');

                                                                        }}
                                                                    >
                                                                        <img src={media.url} height={150} width={"100%"} />
                                                                    </Button>}

                                                                    {media.type == "VIDEO" &&
                                                                        <IconButton onClick={() => {

                                                                            // open new page 

                                                                            window.open(media.url, '_blank');

                                                                        }}>
                                                                            <PlayCircleOutline />
                                                                        </IconButton>}
                                                                </Paper>
                                                            </Grid>))}

                                                    </Grid>
                                                </Box>
                                                <Divider />
                                            </DetailModal>
                                        )
                                    })

                                },
                                icon: <Info />,
                            },
                            {
                                label: "Hapus",
                                onClick(item) {
                                    deleteEvent({
                                        variables: {
                                            id: parseInt(item.id)
                                        }
                                    }).then(({ data }) => {
                                        toast.success('Berhasil menghapus data')
                                        refetch();
                                    }).catch((err) => {
                                        console.log(err)
                                        toast.error('Terjadi kesalahan saat menghapus data ' + err)
                                    });
                                },
                                colorType: "error",
                                icon: <Delete />,
                            },
                        ]}
                    />
                </>}
            </Container>
        </DashboardLayout>
    )
}



const containerStyle = {
    width: '100%',
    height: '400px'
};


export function Create({
    back,
    defaultValues
}: {
    back: () => void,
    defaultValues?: Event | null
}) {

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "AIzaSyCPS20NagOhZRkVhyyNchxO6DkZ3zBq9Fg"
    });

    const [center, setCenter] = React.useState<{
        lat: number;
        lng: number;
    }>({
        lng: 110.3863,
        lat: -7.7737,
    });

    const [map, setMap] = React.useState<google.maps.Map | null>(null)

    const onLoad = React.useCallback(function callback(map: google.maps.Map) {
        setMap(map)
    }, [])



    const event = z.object({
        name: z.string().min(1).max(20),
        description: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        address: z.string(),
        placeId: z.string(),
    });

    type Event = z.infer<typeof event>;

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        setError,
        getValues,
    } = useForm<Event>({
        resolver: zodResolver(event),

        defaultValues: {
            name: defaultValues?.name,
        }

    });



    const [submit, { loading, error }] = useMutation(

        defaultValues ? gql`
        mutation UpdateEvent($id: Int!, $address: String, $endDate: String, $medias: [MediaInput!], $startDate: String, $placeId: Int, $name: String) {
            updateEvent(id: $id, address: $address, endDate: $endDate, medias: $medias, startDate: $startDate, placeId: $placeId, name: $name) {
              id
            }
          }
        ` :
            gql`
            mutation CreateEvent($address: String!, $endDate: String!, $medias: [MediaInput!]!, $name: String!, $placeId: Int!, $startDate: String!) {
                createEvent(address: $address, endDate: $endDate, medias: $medias, name: $name, placeId: $placeId, startDate: $startDate) {
                  id
                }
              }
    `

    )


    const onSubmit = (data: Event) => {
        console.log("pressedd");
        // check if the data is valid using zod
        const result = event.safeParse(data);
        if (!result.success) {
            // set error to the form

            for (const error of result.error.errors) {
                console.log(error);

                setError(error.path[0] as any, {
                    type: "manual",
                    message:
                        error.code == "invalid_type" ? "Harus di isi" : error.message,
                });
            }

            return;
        }

        // submit the data to the server

        submit({
            variables: {
                id: defaultValues ? parseInt(defaultValues?.id) : undefined,
                name: data.name,
                description: data.description,
                startDate: data.startDate,
                endDate: data.endDate,
                address: data.address,
                placeId: parseInt(data.placeId),
                medias: medias.map((e, i) => ({
                    ...e,
                    index: i,
                    isVr: e.isVr ? true : false,
                    __typename: undefined,
                    id: e.id ? parseInt(e.id) : undefined
                }))
            }
        }).then(e => {
            back();
            toast("Berhasil menambahkan Acara");
        }).catch(e => {
            toast("Gagal menambahkan Acara " + e);
        })


    };





    const [timer, setTimer] = React.useState<null | NodeJS.Timer>(null);

    const handleSearch = (cb: () => void) => {
        timer && clearTimeout(timer);
        const newTimer = setTimeout(cb, 150);
        setTimer(newTimer);
    };

    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const [selectedMediaType, setSelectedMediaType] = React.useState<string>("IMAGE");
    const [mediaShown, setMediaShown] = React.useState<Partial<MediaEvent> | null>(null);


    const [
        fetchPlaces,
        { called, data: placeData }
    ] = useLazyQuery<{
        places: Place[]
    }>(gql`query Places($take: Int, $skip: Int, $search: String) {
        places(take: $take, skip: $skip, search: $search) {
          createdAt
          id
          name
        }
      }`)

    const [medias, setMedias] = React.useState<Partial<MediaEvent>[]>(
        defaultValues?.medias ? defaultValues.medias.map(e => e) : []
    );

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={{
                    position: 'absolute' as 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 900,
                    height: 600,
                    bgcolor: 'background.paper',
                    border: '2px solid #000',
                    boxShadow: 24,
                    p: 6,
                }}>
                    <Button variant="contained" color="error" fullWidth sx={{ mb: 2 }} onClick={handleClose}>Close</Button>
                    {mediaShown && <div>
                        {mediaShown.kind == "YOUTUBE" && <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${getYouTubeID(mediaShown.url as string)}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />}
                        {mediaShown.type == "IMAGE" && <img src={mediaShown.url} style={{ width: "100%", height: "100%" }} />}
                        {mediaShown.type == "VIDEO" && mediaShown.kind !== "YOUTUBE" && <video controls src={mediaShown.url} style={{ width: "100%", height: "100%" }} />}
                    </div>}
                </Box>
            </Modal>
            <Paper elevation={3} sx={{ p: 2 }}>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                        paddingY: 2,
                    }}
                >
                    <Typography variant="h4" component={"h1"}>
                        Input Acara
                    </Typography>
                    <Typography variant="body2" component={"p"}>
                        Tambahkan data Acara
                    </Typography>
                </Box>
                <Divider />
                {/* Name */}
                <Box
                    sx={{
                        py: 2,
                        display: "flex",
                    }}
                >
                    <Typography variant="h4" component={"h6"} sx={{ width: "40%" }}>
                        Nama
                    </Typography>
                    <Box
                        sx={{
                            display: "flex",
                            gap: 2,
                            width: "100%",
                        }}
                    >
                        <TextField
                            fullWidth
                            label="Nama Acara"
                            {...register("name")}
                            error={!!errors.name}
                            helperText={errors.name?.message}
                        />

                    </Box>
                </Box>
                <Divider />
                {/* Jadwal */}
                <Box
                    sx={{
                        py: 2,
                        display: "flex",
                    }}
                >
                    <Typography variant="h4" component={"h6"} sx={{ width: "40%" }}>
                        Jadwal
                    </Typography>

                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                            width: "100%",
                        }}
                    >
                        <Box sx={{
                            display: "flex",
                            gap: 2,
                            width: "100%",
                        }}>
                            <DateTimePicker<Moment>
                                label="Mulai pada"
                                renderInput={(params) => <TextField {...params}
                                    sx={{
                                        width: "50%"
                                    }}
                                    error={!!errors.startDate}
                                    helperText={errors.startDate?.message}
                                />}

                                {...register("startDate")}
                                value={moment(watch("startDate") ?? new Date())}
                                onChange={(newValue) => {
                                    if (newValue)
                                        setValue("startDate", newValue?.toISOString());
                                }}
                            />
                            <DateTimePicker<Moment>
                                label="Selesai pada"
                                renderInput={(params) => <TextField {...params}
                                    sx={{
                                        width: "50%"
                                    }}
                                    error={!!errors.endDate}
                                    helperText={errors.endDate?.message}
                                />}

                                {...register("endDate")}
                                value={moment(watch("endDate") ?? new Date())}
                                onChange={(newValue) => {
                                    if (newValue)
                                        setValue("endDate", newValue?.toISOString());
                                }}
                            />
                        </Box>
                    </Box>
                </Box>
                <Divider />

                {/* Lokasi */}
                <Box
                    sx={{
                        py: 2,
                        display: "flex",

                    }}
                >
                    <Typography variant="h4" component={"h6"} sx={{ width: "40%" }}>
                        Lokasi
                    </Typography>
                    <Box
                        sx={{
                            display: "flex",
                            gap: 2,
                            width: "100%",
                            flexDirection: "column",
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                gap: 2,
                                width: "100%",
                            }}
                        >
                            <Autocomplete
                                disablePortal
                                options={placeData?.places.map(e => ({ label: e.name, value: e.id })) || []}
                                sx={{ width: "100%" }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Tempat"
                                        error={!!errors.placeId}
                                        helperText={errors.placeId?.message}
                                    />
                                )}
                                isOptionEqualToValue={(option, value) =>
                                    option.value === value.value
                                }
                                onOpen={() => fetchPlaces()}
                                onInputChange={(e, v) => {
                                    handleSearch(
                                        () => {
                                            fetchPlaces({
                                                variables: {
                                                    take: 10,
                                                    skip: 0,
                                                    search: v,
                                                },
                                            });
                                        }
                                    )

                                }}
                                {...register("placeId")}
                                onChange={(e, newValue) => {
                                    if (newValue?.value)
                                        setValue("placeId", newValue?.value);
                                }}
                            />
                        </Box>
                        <Box
                            sx={{
                                display: "flex",
                                gap: 2,
                                width: "100%",
                            }}
                        >
                            <TextField
                                label="Alamat"
                                sx={{ width: "100%" }}
                                multiline
                                rows={2}
                                {...register("address")}
                                error={!!errors.address}
                                helperText={errors.address?.message}
                            />
                        </Box>
                    </Box>

                </Box>
                {/* Deskripsi */}
                <Box
                    sx={{
                        py: 2,
                        display: "flex",
                    }}
                >
                    <Typography variant="h4" component={"h6"} sx={{ width: "40%" }}>
                        Deskripsi
                    </Typography>
                    <Box
                        sx={{
                            display: "flex",
                            gap: 2,
                            width: "100%",
                        }}
                    >
                        <TextField
                            label="Deskripsi"
                            sx={{ width: "100%" }}
                            multiline
                            rows={3}
                            {...register("description")}
                            error={!!errors.description}
                            helperText={errors.description?.message}
                        />
                    </Box>
                </Box>
                <Divider />
                {/* Media */}
                <Box
                    sx={{
                        py: 2,
                        display: "flex",
                    }}
                >
                    <Typography variant="h4" component={"h6"} sx={{ width: "40%" }}>
                        Media
                    </Typography>
                    <Box
                        sx={{
                            display: "flex",
                            gap: 2,
                            width: "100%",
                            flexDirection: "column",
                        }}
                    >
                        <Box sx={{
                            display: "flex",
                            gap: 2,
                        }}>
                            <FormControl sx={{ width: "30%" }}>
                                <InputLabel id="demo-simple-select-label">Tipe Media</InputLabel>
                                <Select

                                    value={selectedMediaType}
                                    onChange={(e) => {
                                        setSelectedMediaType(e.target.value);
                                    }}
                                    label="Tipe Media"
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select">
                                    <MenuItem value="IMAGE">Foto</MenuItem>
                                    <MenuItem value="VIDEO">Video</MenuItem>
                                    <MenuItem value="YOUTUBE">Youtube</MenuItem>
                                </Select>
                            </FormControl>
                            <Button
                                endIcon={<Add />}
                                onClick={() => {
                                    if (selectedMediaType === "IMAGE") {
                                        setMedias([...medias, {
                                            type: "IMAGE",
                                            url: "",
                                            kind: "LOCAL"
                                        }]);
                                    } else if (selectedMediaType === "VIDEO") {
                                        setMedias([...medias, {
                                            type: "VIDEO",
                                            url: "",
                                            kind: "LOCAL",

                                        }]);
                                    } else if (selectedMediaType === "YOUTUBE") {
                                        setMedias([...medias, {
                                            kind: "YOUTUBE",
                                            url: "",
                                            type: "VIDEO"
                                        }]);
                                    }
                                }}
                                fullWidth
                                variant="contained"
                            >
                                Tambah Media
                            </Button>


                        </Box>
                        {medias.map((media, i) => {
                            const toggleVr = () => {
                                setMedias(newMedias => newMedias.map((e, j) => {
                                    if (i === j) {
                                        return {
                                            ...e,
                                            isVr: e.isVr ? false : true,
                                        }
                                    }
                                    return e;
                                }));
                            }
                            const handleDelete = () => {
                                setMedias(newMedias => newMedias.filter((e, j) => i !== j));
                            }

                            const handleSee = () => {
                                setMediaShown(media);
                                handleOpen();
                            }

                            const handleChangeURL = (vt: any) => {

                                setMedias(newMedias => newMedias.map((e, j) => {
                                    if (i === j) {
                                        return {
                                            ...e,
                                            kind: "YOUTUBE",
                                            url: vt.target.value
                                        }
                                    }
                                    return e;
                                }));

                            }

                            const handleUpload = (e: any) => {
                                const formData = new FormData();
                                if (!e.target?.files || !e.target?.files[0]) return;
                                formData.append("file", e.target.files[0]);
                                httpClient.post("/upload", formData).then((res) => {
                                    const url = res.data
                                    setMedias(newMedias => newMedias.map((e, j) => {
                                        if (i === j) {
                                            return {
                                                ...e,
                                                kind: "LOCAL",
                                                url: url
                                            }
                                        }
                                        return e;
                                    }));
                                })
                            }

                            if (media.kind === "YOUTUBE" && media.type === "VIDEO") {
                                return <Box
                                    key={`${i}-${media.url}`}
                                    sx={{
                                        display: "flex",
                                        gap: 2,
                                    }}>
                                    <TextField
                                        label="URL Youtube"
                                        onChange={handleChangeURL}
                                        value={media.url}
                                        fullWidth
                                    />
                                    <FormControlLabel control={<Switch
                                        checked={media.isVr}
                                        onChange={toggleVr}
                                    />} label={
                                        <Vrpano />
                                    }
                                        labelPlacement='start'
                                    />
                                    <Button
                                        variant="contained"
                                    >
                                        <Add />
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleSee}
                                    >
                                        <Visibility />
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        onClick={handleDelete}
                                    >
                                        <Delete />
                                    </Button>
                                </Box>
                            }
                            if (media.kind == "LOCAL" && (media.url?.length ?? 0) > 0) {
                                return <Box
                                    key={`${i}-${media.url}`}
                                    sx={{
                                        display: "flex",
                                        gap: 2,
                                    }}>
                                    <Paper sx={{
                                        width: "100%", height: "100%", pt: 1,
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}>
                                        {
                                            media.type == "IMAGE" && <img src={media.url} height={50} />
                                        }
                                        {
                                            media.type == "VIDEO" && <video controls src={media.url} height={50} />
                                        }
                                        {/* <Typography variant="body1" textAlign={"center"} component={"h6"} sx={{ width: "100%" }}>
                                            nama file
                                        </Typography> */}
                                    </Paper>
                                    <FormControlLabel control={<Switch
                                        checked={media.isVr}
                                        onChange={toggleVr}
                                    />} label={
                                        <Vrpano />
                                    }
                                        labelPlacement='start'
                                    />
                                    <Button
                                        variant="contained"
                                    >
                                        <Add />
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleSee}
                                    >
                                        <Visibility />
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        onClick={handleDelete}
                                    >
                                        <Delete />
                                    </Button>
                                </Box>
                            }

                            if (media.kind === "LOCAL") {
                                return <Box
                                    key={`${i}-${media.url}`}
                                    sx={{
                                        display: "flex",
                                        gap: 2,
                                    }}>
                                    <Button
                                        startIcon={<Upload />}
                                        fullWidth variant="contained" component="label">
                                        Upload
                                        <input hidden type="file" onChange={handleUpload} />
                                    </Button>
                                    <FormControlLabel control={<Switch
                                        checked={media.isVr}
                                        onChange={toggleVr}
                                    />} label={
                                        <Vrpano />
                                    }
                                        labelPlacement='start'
                                    />
                                    <Button
                                        variant="contained"
                                    >
                                        <Add />
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleSee}
                                    >
                                        <Visibility />
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        onClick={handleDelete}
                                    >
                                        <Delete />
                                    </Button>
                                </Box>
                            }


                        })}


                    </Box>
                </Box>
                <Divider />
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 2,
                        mt: 2,
                    }}
                >
                    <Button type="submit" variant="contained" startIcon={
                        defaultValues ? <Edit /> : <PlusOne />
                    }>
                        {
                            defaultValues ? "Simpan Perubahan" : "Buat Acara"
                        }
                    </Button>
                    <Button type="button" startIcon={<Close />} color="error">
                        Batal
                    </Button>
                </Box>
            </Paper>
        </form>
    );
}





interface DetailSection {
    title: string;
    children: {
        label: string;
        value: string | ReactNode;
    }[];
}



