import { useEffect, useState } from "react";

import UsersLists from "../Components/UserLists";
import ErrorModal from "../../Shared/Components/UIElements/ErrorModal";
import LoadingSpinner from "../../Shared/Components/UIElements/LoadingSpinner";

import { useHttpClient } from "../../Shared/Hooks/Http-Hook";

const User = () => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedUser, setLoadedUser] = useState();

  useEffect(() => {
    const sendReq = async () => {
      try {
        const responseData = await sendRequest(
          process.env.REACT_APP_BACKEND_URL + "/users"
        );

        setLoadedUser(responseData.users);
      } catch (error) {}
    };
    sendReq();
  }, [sendRequest]);

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && loadedUser && <UsersLists items={loadedUser} />}
    </>
  );
};

export default User;
