import { gql, useMutation, useQuery } from "@apollo/client";
import { Delete, Info } from "@mui/icons-material";
import { Container, Box, Typography, Avatar } from "@mui/material";
import DashboardLayout, { useTabs } from "components/DashboardLayout";
import { useModalStore } from "components/ModalUI";
import { client } from "constant";
import usePagination from "hooks/pagination";
import useSort from "hooks/sort";
import React from "react";
import { CommentPlace, EventAnalytic, Favorite, Media, MediaEvent, User, UserAnalytic } from "type";
import DataView from "components/DataView";
import DetailModal from "components/DetailModal";
import getYouTubeID from "get-youtube-id";
import { toast } from "react-toastify";

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



    const {
        data,
        refetch
    } = useQuery<{
        comments: CommentPlace[];
        count: number;
    }>(gql`
    query Medias($take: Int, $skip: Int, $table: Countable, $sortBy:CommentFields, $sortOrder: SortOrder) {
        comments(skip: $skip, take: $take, sortBy: $sortBy, sortOrder: $sortOrder) {
            id
            content
            user{
                id
                name
                avatar
            }

            place{
                id
                name
                thumbnail{
                    url
                }
            }
            
            updatedAt
            createdAt
       
        }
        count(table: $table)
      }`, {

        variables: {
            take: limit,
            skip: page * limit,
            table: "CommentPlace",
            sortBy,
            sortOrder
        }

    })


    const [deleteComment] = useMutation(

        gql`
    mutation Comment($id:Int!) {
        deleteComment(id:$id) {
          id
        }
      }
    `


    )


    return (
        <DashboardLayout headerName='Komentar' tabs={['List Komentar']}>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <DataView<CommentPlace>
                    handleOrderChange={handleSortOrderChange}
                    handleSortChange={handleSortChange}
                    cardRenderMap={{
                        title: 'user.name',
                        subtitle: 'place.name',
                        image: 'place.thumbnail.url',
                    }}
                    definition={[
                        {
                            label: "ID",
                            key: "id",
                        },
                        {
                            label: "Pengguna",
                            key: "user",
                            render(item) {
                                return <Box display="flex" gap={2} alignItems="center">
                                    <Avatar src={item?.user.avatar ?? ""} alt={item.id} />
                                    <Typography variant="body1">{item.user.name}</Typography>
                                </Box>
                            },
                        },
                        {
                            label: "Tempat",
                            key: "user",
                            render(item) {
                                return <Box display="flex" gap={2} alignItems="center">
                                    <Avatar src={item?.place.thumbnail?.url ?? ""} alt={item.id} />
                                    <Typography variant="body1">{item.place.name}</Typography>
                                </Box>
                            },
                        },
                        {
                            label: "Konten",
                            key: "content",
                            render(item) {
                                return <Box sx={{
                                    maxWidth: 200,
                                }}>
                                    <Typography variant="body1">{item.content}</Typography>
                                </Box>
                            },
                        },
                        {
                            label: "Dibuat Pada",
                            key: "createdAt",
                        },
                    ]}
                    data={data?.comments || []}
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
                            label: "Hapus",
                            onClick(item) {
                                deleteComment({
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
            </Container>
        </DashboardLayout>
    )
}
