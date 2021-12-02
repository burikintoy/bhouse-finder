import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useHttpClient } from "../../Shared/Hooks/Http-Hook";

import PlaceList from "../Components/PlaceList";
import ErrorModal from "../../Shared/Components/UIElements/ErrorModal";
import LoadingSpinner from "../../Shared/Components/UIElements/LoadingSpinner";

import "./PlaceForm.css";

const UserPlaces = () => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const [loadedPlaces, setLoadedPlaces] = useState();
  const { userId } = useParams();

  useEffect(() => {
    const sendReq = async () => {
      try {
        const responseData = await sendRequest(
          process.env.REACT_APP_BACKEND_URL + `/places/user/${userId}`
        );
        setLoadedPlaces(responseData.places);
      } catch (error) {}
    };
    sendReq();
  }, [sendRequest, userId]);

  const deletePlaceHandler = (deletedPlaceId) => {
    setLoadedPlaces((prevPlaces) =>
      prevPlaces.filter((place) => place.id !== deletedPlaceId)
    );
  };

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner asOverlay />
        </div>
      )}
      {!isLoading && loadedPlaces && (
        <PlaceList items={loadedPlaces} onDeletePlace={deletePlaceHandler} />
      )}
    </>
  );
};

export default UserPlaces;
