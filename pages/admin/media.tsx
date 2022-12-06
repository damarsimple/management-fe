import { gql, useQuery } from "@apollo/client";
import { Info } from "@mui/icons-material";
import { Container, Box, Typography, Avatar } from "@mui/material";
import DashboardLayout, { useTabs } from "components/DashboardLayout";
import { useModalStore } from "components/ModalUI";
import { client } from "constant";
import usePagination from "hooks/pagination";
import useSort from "hooks/sort";
import React from "react";
import { EventAnalytic, Media, MediaEvent } from "type";
import DataView from "components/DataView";
import DetailModal from "components/DetailModal";
import getYouTubeID from "get-youtube-id";

export default function Medias() {
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
        medias: Media[];
        mediasEvents: MediaEvent[];
        count: number;
    }>(gql`
    query Medias($take: Int, $skip: Int, $table: Countable, $sortBy:MediaFields, $sortOrder: SortOrder) {
        ${value == 0 ? "medias" : "mediasEvents"}(skip: $skip, take: $take, sortBy: $sortBy, sortOrder: $sortOrder) {
            id
            index
            isVr
            kind
            thumbnailUrl
            type
            url
            updatedAt
            createdAt
       
        }
        count(table: $table)
      }`, {

        variables: {
            take: limit,
            skip: page * limit,
            table: value == 0 ? "Media" : "MediaEvent",
            sortBy,
            sortOrder
        }

    })


    return (
        <DashboardLayout headerName='Media' tabs={['List Media Tempat', 'List Media Acara']}>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <DataView<Media | MediaEvent>
                    handleOrderChange={handleSortOrderChange}
                    handleSortChange={handleSortChange}
                    cardRenderMap={{
                        title: 'name',
                        subtitle: 'type',
                        description: "kind",
                        image: 'url',
                    }}
                    definition={[
                        {
                            label: "ID",
                            key: "id",
                        },
                        {
                            label: "Nama",
                            key: "url",
                            render(item) {
                                return <Box display="flex" gap={2} alignItems="center">
                                    <Avatar src={item?.url} alt={item.id} />
                                    <Typography variant="body1">{item.kind}</Typography>
                                </Box>
                            },
                        },
                    ]}
                    data={(value == 0 ? data?.medias : data?.mediasEvents) || []}
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

                                openWithChildren(<>
                                    {item.type === "IMAGE" && <img width="100%" height="60%" src={item.url} />}
                                    {item.type === "VIDEO" && item.kind == "YOUTUBE" && <iframe width="100%" height="60%" src={`https://www.youtube.com/embed/${getYouTubeID(item.url)}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />}
                                    <DetailModal sections={[
                                        {
                                            title: "Detail Media",
                                            children: [
                                                {
                                                    label: "URL",
                                                    value: item.url
                                                },
                                                {
                                                    label: "Tipe",
                                                    value: item.type
                                                },
                                                {
                                                    label: "Tipe 2",
                                                    value: item.kind
                                                }
                                            ]
                                        }
                                    ]} />


                                </>)

                            },
                            icon: <Info />,
                        },
                    ]}
                />
            </Container>
        </DashboardLayout>
    )
}
