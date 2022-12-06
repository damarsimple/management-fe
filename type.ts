export type Maybe<T> = T | null
export type Exact<T extends { [key: string]: unknown }> = {
    [K in keyof T]: T[K]
}
export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
    { [SubKey in K]?: Maybe<T[SubKey]> }
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> &
    { [SubKey in K]: Maybe<T[SubKey]> }
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
    ID: string
    String: string
    Boolean: boolean
    Int: number
    Float: number
    Date: any
}

export type AuthPayload = {
    __typename?: "AuthPayload"
    message?: Maybe<Scalars["String"]>
    status: Scalars["Boolean"]
    token?: Maybe<Scalars["String"]>
    user?: Maybe<User>
}

export type City = {
    __typename?: "City"
    createdAt: Scalars["Date"]
    id: Scalars["ID"]
    name: Scalars["String"]
    places: Array<Place>
    province: Province
    updatedAt: Scalars["Date"]
}

export enum CommentFields {
    Content = "content",
    CreatedAt = "createdAt",
    Id = "id",
    UpdatedAt = "updatedAt"
}

export type CommentPlace = {
    __typename?: "CommentPlace"
    content: Scalars["String"]
    createdAt: Scalars["Date"]
    id: Scalars["ID"]
    place: Place
    updatedAt: Scalars["Date"]
    user: User
}

export enum Countable {
    City = "City",
    CommentPlace = "CommentPlace",
    Event = "Event",
    Favorite = "Favorite",
    Media = "Media",
    MediaEvent = "MediaEvent",
    Participation = "Participation",
    Place = "Place",
    Proposal = "Proposal",
    Province = "Province",
    Rating = "Rating",
    User = "User"
}

export type Event = {
    __typename?: "Event"
    address: Scalars["String"]
    createdAt: Scalars["Date"]
    description?: Maybe<Scalars["String"]>
    endDate: Scalars["Date"]
    id: Scalars["ID"]
    medias: Array<MediaEvent>
    name: Scalars["String"]
    place: Place
    startDate: Scalars["Date"]
    thumbnail?: Maybe<MediaEvent>
    updatedAt: Scalars["Date"]
}

export type EventAnalytic = {
    __typename?: "EventAnalytic"
    media: Scalars["Int"]
    participants: Scalars["Int"]
    views: Scalars["Int"]
}

export enum EventFields {
    CreatedAt = "createdAt",
    Description = "description",
    EndDate = "endDate",
    Id = "id",
    Name = "name",
    StartDate = "startDate",
    UpdatedAt = "updatedAt"
}

export type Favorite = {
    __typename?: "Favorite"
    createdAt: Scalars["Date"]
    id: Scalars["ID"]
    place: Place
    updatedAt: Scalars["Date"]
    user: User
}

export enum FavoriteFields {
    CreatedAt = "createdAt",
    Id = "id",
    UpdatedAt = "updatedAt"
}

export type Media = {
    __typename?: "Media"
    createdAt: Scalars["Date"]
    id: Scalars["ID"]
    index: Scalars["Int"]
    isVr: Scalars["Boolean"]
    kind: Scalars["String"]
    place: Place
    thumbnailUrl?: Maybe<Scalars["String"]>
    type: Scalars["String"]
    updatedAt: Scalars["Date"]
    url: Scalars["String"]
}

export type MediaEvent = {
    __typename?: "MediaEvent"
    createdAt: Scalars["Date"]
    event: Event
    id: Scalars["ID"]
    index: Scalars["Int"]
    isVr: Scalars["Boolean"]
    kind: Scalars["String"]
    thumbnailUrl?: Maybe<Scalars["String"]>
    type: Scalars["String"]
    updatedAt: Scalars["Date"]
    url: Scalars["String"]
}

export enum MediaFields {
    CreatedAt = "createdAt",
    Id = "id",
    Type = "type",
    UpdatedAt = "updatedAt",
    Url = "url"
}

export type MediaInput = {
    id?: Maybe<Scalars["Int"]>
    index: Scalars["Int"]
    isVr: Scalars["Boolean"]
    kind: MediaKind
    thumbnailUrl?: Maybe<Scalars["String"]>
    type: MediaType
    url: Scalars["String"]
}

/** Media kind */
export enum MediaKind {
    Local = "LOCAL",
    Youtube = "YOUTUBE"
}

/** Media type */
export enum MediaType {
    Audio = "AUDIO",
    Image = "IMAGE",
    Video = "VIDEO"
}

export type Mutation = {
    __typename?: "Mutation"
    createEvent: Event
    createPlace: Place
    createProposal: Proposal
    deleteComment: CommentPlace
    deleteEvent: Event
    deleteMedia: Media
    deleteMediaEvent: MediaEvent
    deletePlace: Place
    deleteProposal: Proposal
    login: AuthPayload
    updateEvent: Event
    updatePlace: Place
    updateProposal: Proposal
}

export type MutationCreateEventArgs = {
    address: Scalars["String"]
    endDate: Scalars["String"]
    medias: Array<MediaInput>
    name: Scalars["String"]
    placeId: Scalars["Int"]
    startDate: Scalars["String"]
}

export type MutationCreatePlaceArgs = {
    city: Scalars["Int"]
    description?: Maybe<Scalars["String"]>
    latitude: Scalars["Float"]
    longitude: Scalars["Float"]
    medias: Array<MediaInput>
    name: Scalars["String"]
    province: Scalars["Int"]
}

export type MutationCreateProposalArgs = {
    authorId: Scalars["Int"]
    cityId: Scalars["Int"]
    comment: Scalars["String"]
    description: Scalars["String"]
    endDate: Scalars["String"]
    latitude: Scalars["Float"]
    longitude: Scalars["Float"]
    name: Scalars["String"]
    provinceId: Scalars["Int"]
    startDate: Scalars["String"]
    status: ProposalStatus
    type: ProposalType
}

export type MutationDeleteCommentArgs = {
    id: Scalars["Int"]
}

export type MutationDeleteEventArgs = {
    id: Scalars["Int"]
}

export type MutationDeleteMediaArgs = {
    id: Scalars["Int"]
}

export type MutationDeleteMediaEventArgs = {
    id: Scalars["Int"]
}

export type MutationDeletePlaceArgs = {
    id: Scalars["Int"]
}

export type MutationDeleteProposalArgs = {
    id: Scalars["Int"]
}

export type MutationLoginArgs = {
    email: Scalars["String"]
    password: Scalars["String"]
}

export type MutationUpdateEventArgs = {
    address?: Maybe<Scalars["String"]>
    endDate?: Maybe<Scalars["String"]>
    id: Scalars["Int"]
    medias?: Maybe<Array<MediaInput>>
    name?: Maybe<Scalars["String"]>
    placeId?: Maybe<Scalars["Int"]>
    startDate?: Maybe<Scalars["String"]>
}

export type MutationUpdatePlaceArgs = {
    city?: Maybe<Scalars["Int"]>
    description?: Maybe<Scalars["String"]>
    id: Scalars["Int"]
    latitude?: Maybe<Scalars["Float"]>
    longitude?: Maybe<Scalars["Float"]>
    medias: Array<MediaInput>
    name?: Maybe<Scalars["String"]>
    province?: Maybe<Scalars["Int"]>
}

export type MutationUpdateProposalArgs = {
    authorId?: Maybe<Scalars["Int"]>
    cityId?: Maybe<Scalars["Int"]>
    comment?: Maybe<Scalars["String"]>
    description?: Maybe<Scalars["String"]>
    endDate?: Maybe<Scalars["String"]>
    id: Scalars["Int"]
    latitude?: Maybe<Scalars["Float"]>
    longitude?: Maybe<Scalars["Float"]>
    name?: Maybe<Scalars["String"]>
    provinceId?: Maybe<Scalars["Int"]>
    startDate?: Maybe<Scalars["String"]>
    status?: Maybe<ProposalStatus>
    type?: Maybe<ProposalType>
}

export type Participation = {
    __typename?: "Participation"
    createdAt: Scalars["Date"]
    event: Event
    id: Scalars["ID"]
    updatedAt: Scalars["Date"]
    user: User
}

export enum ParticipationFields {
    CreatedAt = "createdAt",
    Id = "id",
    UpdatedAt = "updatedAt"
}

export type Place = {
    __typename?: "Place"
    city?: Maybe<City>
    commentplaces: Array<CommentPlace>
    createdAt: Scalars["Date"]
    description?: Maybe<Scalars["String"]>
    events: Array<Event>
    favorites: Array<Favorite>
    id: Scalars["ID"]
    latitude: Scalars["Float"]
    longitude: Scalars["Float"]
    medias: Array<Media>
    name: Scalars["String"]
    province?: Maybe<Province>
    ratings: Array<Rating>
    thumbnail?: Maybe<Media>
    updatedAt: Scalars["Date"]
}

export type PlaceAnalytic = {
    __typename?: "PlaceAnalytic"
    comments: Scalars["Int"]
    events: Scalars["Int"]
    favorites: Scalars["Int"]
    ratingAverage: Scalars["Float"]
    ratings: Scalars["Int"]
    views: Scalars["Int"]
}

export enum PlaceFields {
    CreatedAt = "createdAt",
    Description = "description",
    Id = "id",
    Latitude = "latitude",
    Longitude = "longitude",
    Name = "name",
    UpdatedAt = "updatedAt"
}

export type Proposal = {
    __typename?: "Proposal"
    author: User
    city: City
    comment?: Maybe<Scalars["String"]>
    createdAt: Scalars["Date"]
    description?: Maybe<Scalars["String"]>
    endDate?: Maybe<Scalars["Date"]>
    id: Scalars["ID"]
    latitude?: Maybe<Scalars["Float"]>
    longitude?: Maybe<Scalars["Float"]>
    name: Scalars["String"]
    province: Province
    startDate?: Maybe<Scalars["Date"]>
    status: ProposalStatus
    type: ProposalType
    updatedAt: Scalars["Date"]
}

export enum ProposalFields {
    AuthorId = "authorId",
    CityId = "cityId",
    Comment = "comment",
    CreatedAt = "createdAt",
    Description = "description",
    EndDate = "endDate",
    Id = "id",
    Latitude = "latitude",
    Longitude = "longitude",
    Name = "name",
    Province = "province",
    StartDate = "startDate",
    Status = "status",
    Type = "type",
    UpdatedAt = "updatedAt"
}

/** Media type */
export enum ProposalStatus {
    Approved = "APPROVED",
    Pending = "PENDING",
    Rejected = "REJECTED"
}

/** Media type */
export enum ProposalType {
    Event = "EVENT",
    Place = "PLACE"
}

export type Province = {
    __typename?: "Province"
    createdAt: Scalars["Date"]
    id: Scalars["ID"]
    name: Scalars["String"]
    places: Array<Place>
    updatedAt: Scalars["Date"]
}

export type Query = {
    __typename?: "Query"
    cities: Array<City>
    comment: CommentPlace
    comments: Array<CommentPlace>
    count: Scalars["Int"]
    event: Event
    eventAnalytic: EventAnalytic
    events: Array<Event>
    favorite: Favorite
    favorites: Array<Favorite>
    media: Media
    mediaEvent: MediaEvent
    medias: Array<Media>
    mediasEvents: Array<MediaEvent>
    participantion: Participation
    participations: Array<Participation>
    place: Place
    placeAnalytic: PlaceAnalytic
    places: Array<Place>
    proposal: Proposal
    proposals: Array<Proposal>
    provinces: Array<Province>
    user: User
    userAnalytic: UserAnalytic
    users: Array<User>
}

export type QueryCitiesArgs = {
    provinceId?: Maybe<Scalars["Int"]>
    search?: Maybe<Scalars["String"]>
    skip?: Maybe<Scalars["Int"]>
    take?: Maybe<Scalars["Int"]>
}

export type QueryCommentArgs = {
    id: Scalars["Int"]
}

export type QueryCommentsArgs = {
    skip?: Maybe<Scalars["Int"]>
    sortBy?: Maybe<CommentFields>
    sortOrder?: Maybe<SortOrder>
    tag?: Maybe<Scalars["String"]>
    take?: Maybe<Scalars["Int"]>
}

export type QueryCountArgs = {
    table?: Maybe<Countable>
}

export type QueryEventArgs = {
    id: Scalars["Int"]
}

export type QueryEventAnalyticArgs = {
    id: Scalars["Int"]
}

export type QueryEventsArgs = {
    skip?: Maybe<Scalars["Int"]>
    sortBy?: Maybe<EventFields>
    sortOrder?: Maybe<SortOrder>
    tag?: Maybe<Scalars["String"]>
    take?: Maybe<Scalars["Int"]>
}

export type QueryFavoriteArgs = {
    id: Scalars["Int"]
}

export type QueryFavoritesArgs = {
    skip?: Maybe<Scalars["Int"]>
    sortBy?: Maybe<FavoriteFields>
    sortOrder?: Maybe<SortOrder>
    tag?: Maybe<Scalars["String"]>
    take?: Maybe<Scalars["Int"]>
}

export type QueryMediaArgs = {
    id: Scalars["Int"]
}

export type QueryMediaEventArgs = {
    id: Scalars["Int"]
}

export type QueryMediasArgs = {
    skip?: Maybe<Scalars["Int"]>
    sortBy?: Maybe<MediaFields>
    sortOrder?: Maybe<SortOrder>
    take?: Maybe<Scalars["Int"]>
}

export type QueryMediasEventsArgs = {
    skip?: Maybe<Scalars["Int"]>
    sortBy?: Maybe<MediaFields>
    sortOrder?: Maybe<SortOrder>
    take?: Maybe<Scalars["Int"]>
}

export type QueryParticipantionArgs = {
    id: Scalars["Int"]
}

export type QueryParticipationsArgs = {
    skip?: Maybe<Scalars["Int"]>
    sortBy?: Maybe<ParticipationFields>
    sortOrder?: Maybe<SortOrder>
    tag?: Maybe<Scalars["String"]>
    take?: Maybe<Scalars["Int"]>
}

export type QueryPlaceArgs = {
    id: Scalars["Int"]
}

export type QueryPlaceAnalyticArgs = {
    id: Scalars["Int"]
}

export type QueryPlacesArgs = {
    search?: Maybe<Scalars["String"]>
    skip?: Maybe<Scalars["Int"]>
    sortBy?: Maybe<PlaceFields>
    sortOrder?: Maybe<SortOrder>
    tag?: Maybe<Scalars["String"]>
    take?: Maybe<Scalars["Int"]>
}

export type QueryProposalArgs = {
    id: Scalars["Int"]
}

export type QueryProposalsArgs = {
    skip?: Maybe<Scalars["Int"]>
    sortBy?: Maybe<ProposalFields>
    sortOrder?: Maybe<SortOrder>
    tag?: Maybe<Scalars["String"]>
    take?: Maybe<Scalars["Int"]>
}

export type QueryProvincesArgs = {
    search?: Maybe<Scalars["String"]>
    skip?: Maybe<Scalars["Int"]>
    take?: Maybe<Scalars["Int"]>
}

export type QueryUserArgs = {
    id: Scalars["Int"]
}

export type QueryUserAnalyticArgs = {
    id: Scalars["Int"]
}

export type QueryUsersArgs = {
    search?: Maybe<Scalars["String"]>
    skip?: Maybe<Scalars["Int"]>
    sortBy?: Maybe<UserFields>
    sortOrder?: Maybe<SortOrder>
    take?: Maybe<Scalars["Int"]>
}

export type Rating = {
    __typename?: "Rating"
    createdAt: Scalars["Date"]
    id: Scalars["ID"]
    place: Place
    updatedAt: Scalars["Date"]
    user: User
    value: Scalars["Int"]
}

export enum SortOrder {
    Asc = "asc",
    Desc = "desc"
}

export type User = {
    __typename?: "User"
    avatar?: Maybe<Scalars["String"]>
    commentplaces: Array<CommentPlace>
    createdAt: Scalars["Date"]
    email: Scalars["String"]
    favorites: Array<Favorite>
    id: Scalars["ID"]
    name?: Maybe<Scalars["String"]>
    phone?: Maybe<Scalars["String"]>
    proposals: Array<Proposal>
    ratings: Array<Rating>
    updatedAt: Scalars["Date"]
}

export type UserAnalytic = {
    __typename?: "UserAnalytic"
    comments: Scalars["Int"]
    events: Scalars["Int"]
    favorites: Scalars["Int"]
    ratingAverage: Scalars["Float"]
    ratings: Scalars["Int"]
}

export enum UserFields {
    CreatedAt = "createdAt",
    Email = "email",
    Id = "id",
    Name = "name",
    UpdatedAt = "updatedAt"
}
