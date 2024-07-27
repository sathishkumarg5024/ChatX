export const HOST = import.meta.env.VITE_SERVER_URL;

export const AUTH_ROUTES = "api/auth";
export const SIGNUP_ROUTE = `${AUTH_ROUTES}/signup`;
export const LOGIN_ROUTE = `${AUTH_ROUTES}/login`;
export const GET_USERINFO = `${AUTH_ROUTES}/user-info`;
export const UPDATE_PROFILE = `${AUTH_ROUTES}/update-profile`;
export const ADD_PROFILE_IMAGE = `${AUTH_ROUTES}/add-profile`;
export const REMOVE_PROFILE_IMAGE = `${AUTH_ROUTES}/remove-profile`;
export const LOGOUT = `${AUTH_ROUTES}/logout`;

export const CONTACT_ROUTES = "api/contacts";
export const SEARCH_CONTACTS = `${CONTACT_ROUTES}/search`;
export const GET_CONTACTS_FOR_DM = `${CONTACT_ROUTES}/get-contacts-for-dm`;
export const GET_ALL_CONTACTS = `${CONTACT_ROUTES}//get-all-contacts`;

export const MESSAGES_ROUTES = "api/messages";
export const GET_ALL_MSGS = `${MESSAGES_ROUTES}/get-messages`;
export const UPLOAD_FILE = `${MESSAGES_ROUTES}//upload-file`;

export const CHANNEL_ROUTES = "api/channel";
export const CREATE_CHANNEL = `${CHANNEL_ROUTES}/create-channel`;
export const GET_USER_CHANNELS = `${CHANNEL_ROUTES}/get-user-channels`;
export const GET_CHANNEL_MSGS = `${CHANNEL_ROUTES}/get-channel-msgs`;
