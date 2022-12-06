import { ApolloClient, InMemoryCache } from "@apollo/client";
import axios from "axios";
export const client = new ApolloClient({
    uri: process.env.NEXT_PUBLIC_API_URL + '/graphql',
    cache: new InMemoryCache()
})

export const httpClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL + ''
})