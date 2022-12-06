import { Autocomplete, Container, FormControl, FormControlLabel, Grid, IconButton, InputLabel, MenuItem, Modal, Select, Switch } from '@mui/material'
import DashboardLayout, { useTabs } from 'components/DashboardLayout'
import React, { ReactNode } from 'react'
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { DesktopDatePicker } from "@mui/x-date-pickers";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { useModalStore } from 'components/ModalUI';
import DataView from 'components/DataView';

import {
    Add,
    Close,
    Delete,
    Edit,
    Info,
    Map,
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
import { City, Media, Place, PlaceAnalytic, Province } from 'type';
import usePagination from 'hooks/pagination';
import { client, httpClient } from 'constant';
import getYouTubeID from 'get-youtube-id';
import { toast } from 'react-toastify';
import useSort from 'hooks/sort';
import DetailModal from 'components/DetailModal';


export default function Places() {

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


    const handleFetchAnalytics = async (placeId: string) => {
        const query = gql`query PlaceAnalytic($placeAnalyticId: Int!) {
            placeAnalytic(id: $placeAnalyticId) {
              comments
              events
              favorites
              ratingAverage
              ratings
              views
            }
          }`

        const { data } = await client.query<{ placeAnalytic: PlaceAnalytic }>({
            query,
            variables: {
                placeAnalyticId: parseInt(placeId)
            }
        })

        return data.placeAnalytic;
    }

    const {
        data,
        refetch
    } = useQuery<{
        places: Place[];
        count: number;
    }>(gql`
    query Places($take: Int, $skip: Int, $table: Countable, $sortBy:PlaceFields, $sortOrder: SortOrder) {
        places(take: $take, skip: $skip, sortBy: $sortBy, sortOrder: $sortOrder) {
          city {
            name
          }
          name
          medias {
            kind
            isVr
            type
            url
            id
          }
          id
          latitude
          longitude
          province {
            name
          }
          thumbnail {
            url
          }
          updatedAt
          createdAt
        }
        count(table: $table)
      }`, {

        variables: {
            take: limit,
            skip: page * limit,
            table: "Brand",
            sortBy,
            sortOrder
        }

    })

    const [editPlace, setEditPlace] = React.useState<Place | null>(null);

    const [deletePlace] = useMutation(

        gql`
    mutation Place($id:Int!) {
        deletePlace(id:$id) {
          id
        }
      }
    `


    )


    return (
        <DashboardLayout headerName='Tempat Wisata' tabs={['List', 'Buat']}>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                {value == 1 ? <Create
                    defaultValues={editPlace}
                    back={() => {
                        setValue(0);
                        handleSortChange('id');
                        handleSortOrderChange('desc');
                        refetch({
                            take: limit,
                            skip: page * limit,
                            table: "Place",
                            sortBy: 'id',
                            sortOrder: 'desc'
                        });
                    }} /> : <>
                    <DataView<Place>
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
                                label: "Daerah",
                                key: "province",
                                render(item) {
                                    if (!item.province?.name) {
                                        return <Typography variant="body2" color="text.secondary">Tidak ada</Typography>
                                    }
                                    return <Typography>
                                        {item.province?.name}, {item.city?.name}
                                    </Typography>
                                },
                            },
                            {
                                label: "Tanggal Dibuat",
                                key: "createdAt",
                            },
                        ]}
                        data={data?.places || []}
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
                                    client.query<{ place: Place }>({
                                        query: gql`query Place($placeId: Int!) {
                                            place(id: $placeId) {
                                                id
                                                name
                                                description
                                                latitude
                                                longitude
                                                province{
                                                    id
                                                }
                                                city {
                                                    id
                                                }
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
                                            placeId: parseInt(item.id)
                                        }
                                    }).then(({ data }) => {
                                        setEditPlace({
                                            // @ts-ignore
                                            provinceId: data.place.province?.id as number,
                                            // @ts-ignore
                                            cityId: data.place.city?.id as number,
                                            ...data.place,
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
                                label: "Lihat Media",
                                onClick(item) {
                                    openWithChildren(
                                        <MediaModal close={close} medias={item.medias} />
                                    )
                                },
                                colorType: "info",
                                icon: <Visibility />,
                            },
                            {
                                label: "Peta",
                                onClick(item) {
                                    setCenter({
                                        lat: item.latitude,
                                        lng: item.longitude
                                    })
                                    openWithChildren(
                                        <>
                                            {isLoaded ? <GoogleMap
                                                mapContainerStyle={containerStyle}
                                                center={center}
                                                zoom={50}
                                                onLoad={onLoad}

                                            >
                                                { /* Child components, such as markers, info windows, etc. */}
                                                <></>
                                            </GoogleMap> : <>Loading Map ...</>}

                                            <Button variant="contained" sx={{ my: 4 }} fullWidth onClick={() => {

                                                window.open(`https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`, '_blank')

                                            }}>
                                                Buka di google map
                                            </Button>
                                        </>
                                    )
                                },
                                colorType: "info",
                                icon: <Map />,
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
                                                                label: "Banyak Event",
                                                                value: clickedAnalytics?.events,
                                                            },
                                                            {
                                                                label: "Banyak Media",
                                                                value: item.medias.length,
                                                            },
                                                            {
                                                                label: "Rating",
                                                                value: `${clickedAnalytics?.ratingAverage} (${clickedAnalytics?.ratings})`,
                                                            },
                                                            {
                                                                label: "Komentar",
                                                                value: clickedAnalytics?.comments,
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
                                    deletePlace({
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
    defaultValues?: Place | null
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



    const place = z.object({
        name: z.string().min(1).max(20),
        provinceId: z.string(),
        cityId: z.string(),
        description: z.string(),
        latitude: z.string(),
        longitude: z.string(),
    });

    type Place = z.infer<typeof place>;

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        setError,
        getValues,
    } = useForm<Place>({
        resolver: zodResolver(place),

        defaultValues: {
            name: defaultValues?.name,
            // provinceId: defaultValues?.provinceId,
            // cityId: defaultValues?.cityId,
            description: defaultValues?.description || "",
            latitude: `${defaultValues?.latitude}`,
            longitude: `${defaultValues?.longitude}`,
        }

    });
   
    const [medias, setMedias] = React.useState<Partial<Media>[]>(
        defaultValues?.medias ? defaultValues.medias.map(e => e) : []
    );

    const [submit, { loading, error }] = useMutation(

        defaultValues ? gql`
        mutation Place($id:Int!, $city: Int!, $latitude: Float!, $longitude: Float!, $medias: [MediaInput!]!, $name: String!, $province: Int!, $description: String) {
            updatePlace(id:$id, city: $city, latitude: $latitude, longitude: $longitude, medias: $medias, name: $name, province: $province, description: $description) {
              id
            }
          }
        ` :
            gql`
    mutation Place($city: Int!, $latitude: Float!, $longitude: Float!, $medias: [MediaInput!]!, $name: String!, $province: Int!, $description: String) {
        createPlace(city: $city, latitude: $latitude, longitude: $longitude, medias: $medias, name: $name, province: $province, description: $description) {
          id
        }
      }
    `

    )


    const onSubmit = (data: Place) => {
        console.log("pressedd");
        // check if the data is valid using zod
        const result = place.safeParse(data);
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
                province: parseInt(data.provinceId),
                city: parseInt(data.cityId),
                latitude: parseFloat(data.latitude),
                longitude: parseFloat(data.longitude),
                name: data.name,
                description: data.description,
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
            toast("Berhasil menambahkan tempat wisata");
        }).catch(e => {
            toast("Gagal menambahkan tempat wisata " + e);
        })


    };

    const [
        fetchCity,
        { data: cityData }
    ] = useLazyQuery<{
        cities: City[]
    }>(gql`query City($take: Int, $skip: Int, $search: String, $provinceId: Int!) {
        cities(take: $take, skip: $skip, search: $search, provinceId: $provinceId) {
          createdAt
          id
          name
        }
      }`)
    
     const [
        fetchProvince,
        { called, data: provinceData }
    ] = useLazyQuery<{
        provinces: Province[]
    }>(gql`query Provinces($take: Int, $skip: Int, $search: String) {
        provinces(take: $take, skip: $skip, search: $search) {
          createdAt
          id
          name
        }
      }`)






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
    const [mediaShown, setMediaShown] = React.useState<Partial<Media> | null>(null);
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
                        Input Tempat Wisata
                    </Typography>
                    <Typography variant="body2" component={"p"}>
                        Tambahkan data tempat wisata
                    </Typography>
                </Box>
                <Divider />
                {/* RC */}
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
                            label="Nama tempat wisata"
                            {...register("name")}
                            error={!!errors.name}
                            helperText={errors.name?.message}
                        />

                    </Box>
                </Box>
                <Divider />
                {/* Location */}
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
                            <Autocomplete
                                disablePortal
                                options={provinceData?.provinces.map(e => ({ label: e.name, value: e.id })) || []}
                                sx={{ width: "50%" }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Provinsi"
                                        error={!!errors.provinceId}
                                        helperText={errors.provinceId?.message}
                                    />
                                )}
                                isOptionEqualToValue={(option, value) =>
                                    option.value === value.value
                                }
                                onOpen={() => fetchProvince()}
                                onInputChange={(e, v) => {
                                    handleSearch(
                                        () => {
                                            fetchProvince({
                                                variables: {
                                                    take: 10,
                                                    skip: 0,
                                                    search: v,
                                                },
                                            });
                                        }
                                    )

                                }}
                                {...register("provinceId")}
                                onChange={(e, newValue) => {
                                    setValue("cityId", "");
                                    if (newValue?.value)
                                        setValue("provinceId", newValue?.value);
                                }}
                            />

                            <Autocomplete
                                disablePortal
                                options={cityData?.cities.map(e => ({ label: e.name, value: e.id })) || []}
                                sx={{ width: "50%" }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Kota"
                                        error={!!errors.cityId}
                                        helperText={errors.cityId?.message}
                                    />
                                )}
                                isOptionEqualToValue={(option, value) =>
                                    option.value === value.value
                                }
                                disabled={!watch("provinceId")}
                                onOpen={() => fetchCity({
                                    variables: {
                                        provinceId: parseInt(watch("provinceId")),
                                    }
                                })}
                                onInputChange={(e, v) => {
                                    handleSearch(
                                        () => {
                                            fetchCity({
                                                variables: {
                                                    take: 10,
                                                    skip: 0,
                                                    search: v,
                                                    provinceId: parseInt(watch("provinceId")),
                                                },
                                            });
                                        }
                                    )

                                }}
                                {...register("cityId")}
                                onChange={(e, newValue) => {
                                    if (newValue?.value)
                                        setValue("cityId", newValue?.value);
                                }}
                            />
                        </Box>
                        <Box sx={{
                            display: "flex",
                            gap: 2,
                            width: "100%",
                        }}>
                            <TextField
                                label="Latitude"
                                sx={{ width: "50%" }}
                                value={center.lat}
                                type="number"
                                {...register("latitude")}
                                onChange={(e) => {
                                    setCenter({
                                        lat: parseFloat(e.target.value),
                                        lng: center.lng,
                                    });
                                    setValue("latitude", e.target.value);
                                }}
                                error={!!errors.latitude}
                                helperText={errors.latitude?.message}

                            />
                            <TextField
                                label="Longitude"
                                sx={{ width: "50%" }}
                                value={center.lng}
                                type="number"
                                {...register("longitude")}
                                onChange={(e) => {
                                    setCenter({
                                        lat: center.lat,
                                        lng: parseFloat(e.target.value),
                                    });
                                    setValue("longitude", e.target.value);
                                }}
                                error={!!errors.longitude}
                                helperText={errors.longitude?.message}

                            />
                        </Box>


                        {isLoaded ? <GoogleMap
                            mapContainerStyle={containerStyle}
                            center={center}
                            zoom={50}
                            onLoad={onLoad}

                        >
                            { /* Child components, such as markers, info windows, etc. */}
                            <></>
                        </GoogleMap> : <>Loading Map ...</>}
                    </Box>
                </Box>
                <Divider />
                {/* Deskripsi */}
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
                            defaultValues ? "Simpan Perubahan" : "Buat Tempat Wisata"
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







function MediaModal({ medias, close }: {
    medias: Media[],
    close: () => void
}) {

    const [currentIndex, setCurrentIndex] = React.useState(0);

    const currentMedia = medias[currentIndex];

    return <React.Fragment>
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
            <Button variant="contained" color="error" fullWidth sx={{ mb: 2 }} onClick={close}>Close</Button>
            {currentMedia.type === "IMAGE" && <img width="100%" height="60%" src={currentMedia.url} />}
            {currentMedia.type === "VIDEO" && currentMedia.kind == "YOUTUBE" && <iframe width="100%" height="60%" src={`https://www.youtube.com/embed/${getYouTubeID(currentMedia.url)}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />}
            <Grid container spacing={1}>
                {medias?.map((media, index) => (
                    <Grid item xs={12} md={3} key={media.id}>
                        <Paper sx={{ position: "relative", p: 2, height: 100, display: "flex", justifyContent: "center", alignItems: "center" }}>
                            {media.type == "IMAGE" && <Button
                                onClick={() => {
                                    setCurrentIndex(index);
                                }}
                            >
                                <img src={media.url} height={80} width={"100%"} />
                            </Button>}

                            {media.type == "VIDEO" &&
                                <IconButton onClick={() => {
                                    setCurrentIndex(index);
                                }}>
                                    <PlayCircleOutline />
                                </IconButton>}

                            {media.isVr && <Vrpano sx={{ position: "absolute", top: 0, left: 0 }} />}
                        </Paper>
                    </Grid>))}
            </Grid>
        </Box>
    </React.Fragment>
}