import { gql, useQuery } from "@apollo/client";
import { Info } from "@mui/icons-material";
import { Container, Box, Typography, Avatar } from "@mui/material";
import DashboardLayout, { useTabs } from "components/DashboardLayout";
import { useModalStore } from "components/ModalUI";
import { client } from "constant";
import usePagination from "hooks/pagination";
import useSort from "hooks/sort";
import React from "react";
import { EventAnalytic, Media, MediaEvent, User, UserAnalytic } from "type";
import DataView from "components/DataView";
import DetailModal from "components/DetailModal";
import getYouTubeID from "get-youtube-id";

export default function Users() {
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


    const handleFetchAnalytics = async (id: string) => {
        const query = gql`query UserAnalytics($id: Int!) {
            userAnalytic(id: $id) {
              events
              favorites
              ratings
              ratingAverage
              comments
            }
          }`

        const { data } = await client.query<{ userAnalytic: UserAnalytic }>({
            query,
            variables: {
                id: parseInt(id)
            }
        })

        return data.userAnalytic;
    }

    const {
        data,
        refetch
    } = useQuery<{
        users: User[];
        count: number;
    }>(gql`
    query Medias($take: Int, $skip: Int, $table: Countable, $sortBy:UserFields, $sortOrder: SortOrder) {
        users(skip: $skip, take: $take, sortBy: $sortBy, sortOrder: $sortOrder) {
            id
            name
            avatar
            updatedAt
            createdAt
       
        }
        count(table: $table)
      }`, {

        variables: {
            take: limit,
            skip: page * limit,
            table: "User",
            sortBy,
            sortOrder
        }

    })


    return (
        <DashboardLayout headerName='Pengguna' tabs={['List User']}>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <DataView<User>
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
                            key: "name",
                            render(item) {
                                return <Box display="flex" gap={2} alignItems="center">
                                    <Avatar src={item?.avatar ?? ""} alt={item.id} />
                                    <Typography variant="body1">{item.name}</Typography>
                                </Box>
                            },
                        },
                        {
                            label: "Dibuat Pada",
                            key: "createdAt",
                        },
                    ]}
                    data={data?.users || []}
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

                                handleFetchAnalytics(item.id).then((userAnalytic) => {
                                    openWithChildren(
                                        <DetailModal sections={[
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
                                                        label: "Banyak Event diikuti",
                                                        value: userAnalytic?.events,
                                                    },
                                                    {
                                                        label: "Banyak Favorite",
                                                        value: userAnalytic?.favorites,
                                                    },

                                                    {
                                                        label: "Rating",
                                                        value: `${userAnalytic?.ratingAverage} (${userAnalytic?.ratings})`,
                                                    },
                                                    {
                                                        label: "Komentar",
                                                        value: userAnalytic?.comments,
                                                    },
                                                ]
                                            },
                                        ]} />
                                    )
                                })

                            },
                            icon: <Info />,
                        },
                    ]}
                />
            </Container>
        </DashboardLayout>
    )
}
