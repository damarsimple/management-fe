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
import { City, Media, Event, EventAnalytic, MediaEvent, Place, Proposal } from 'type';
import usePagination from 'hooks/pagination';
import { client, httpClient } from 'constant';
import getYouTubeID from 'get-youtube-id';
import { toast } from 'react-toastify';
import useSort from 'hooks/sort';
import moment, { Moment } from 'moment';



export default function Proposals() {

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
        proposals: Proposal[];
        count: number;
    }>(gql`
    query Proposals($skip: Int, $sortBy: ProposalFields, $status: ProposalStatus, $take: Int, $type: ProposalType, $sortOrder: SortOrder, $table: Countable) {
        proposals(skip: $skip, sortBy: $sortBy, status: $status, take: $take, type: $type, sortOrder: $sortOrder) {
          name
          id
          latitude
          longitude
          startDate
          status
          type
          updatedAt
          endDate
          description
          createdAt
          comment
          author {
            id
            name
          }
          city {
            id
            name
          }
          province {
            id
            name
          }
        }
        count(table: $table)
      }`, {

        variables: {
            take: limit,
            skip: page * limit,
            table: "Proposal",
            sortBy,
            sortOrder,
            type: value === 0 ? "EVENT" : "PLACE"
        }

    })

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
        <DashboardLayout headerName='Proposal' tabs={['List Acara', 'List Tempat']}>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <>
                    <DataView<Proposal>
                        filterSelect={[
                            {
                                label: "Status",
                                key: "status",
                                options: [
                                    {
                                        label: "Pending",
                                        value: "PENDING"
                                    },
                                    {
                                        label: "Approved",
                                        value: "APPROVED"
                                    },
                                    {
                                        label: "Rejected",
                                        value: "REJECTED"
                                    }
                                ]
                            }
                        ]}
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
                                label: "Name",
                                key: "name",
                            },
                            {
                                label: "Daerah",
                                key: "city",
                                render(item) {
                                    return `${item.city.name}, ${item.province.name}`
                                },
                            },
                        ]}
                        data={data?.proposals || []}
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
                </>
            </Container>
        </DashboardLayout>
    )
}



const containerStyle = {
    width: '100%',
    height: '400px'
};

