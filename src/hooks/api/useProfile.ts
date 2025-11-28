import {useGetProfileQuery} from "@/services/api/profileApi.ts";
import {useDispatch, useSelector} from "react-redux";
import type {RootState} from "@/store/store.ts";
import {useEffect} from "react";
import {setProfile} from "@/store/profileSlice.ts";

export const useProfile = () => {
    const dispatch = useDispatch();
    const profile = useSelector((state: RootState) => state.profile.profile);

    const {data, isLoading, error} = useGetProfileQuery();

    useEffect(() => {
        if (data) {
            dispatch(setProfile(data));
        }
    }, [data, dispatch]);

    return {profile, isLoading, error};
}