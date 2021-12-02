import { useParams, useHistory } from "react-router-dom";
import { useEffect, useState, useContext } from "react";

import Input from "../../Shared/Components/FormsElement/Input";
import Button from "../../Shared/Components/FormsElement/Button";
import Card from "../../Shared/Components/UIElements/Card";
import LoadingSpinner from "../../Shared/Components/UIElements/LoadingSpinner";
import ErrorModal from "../../Shared/Components/UIElements/ErrorModal";

import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH,
} from "../../Shared/util/Validators";
import { useForm } from "../../Shared/Hooks/Form-Hook";
import { useHttpClient } from "../../Shared/Hooks/Http-Hook";
import { AuthContext } from "../../Shared/Context/Auth-Context";

const UpdatePlace = () => {
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedPlace, setLoadedPlace] = useState();
  const { placeId } = useParams();
  const history = useHistory();

  const [formState, inputHandler, setFormData] = useForm(
    {
      title: {
        value: "",
        isValid: false,
      },
      description: {
        value: "",
        isValid: false,
      },
    },
    false
  );

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const responseData = await sendRequest(
          process.env.REACT_APP_BACKEND_URL + `/places/${placeId}`
        );
        setLoadedPlace(responseData.place);
        setFormData(
          {
            title: {
              value: responseData.place.title,
              isValid: true,
            },
            description: {
              value: responseData.place.description,
              isValid: true,
            },
          },
          true
        );
      } catch (error) {}
    };
    fetchPlace();
  }, [sendRequest, setFormData, placeId]);

  const placeUpdateSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      await sendRequest(
        process.env.REACT_APP_BACKEND_URL + `/places/update/${placeId}`,
        "PATCH",
        JSON.stringify({
          title: formState.inputs.title.value,
          description: formState.inputs.description.value,
        }),
        {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.token,
        }
      );
      history.push("/" + auth.userId + "/places");
    } catch (error) {}
  };

  if (isLoading) {
    return <LoadingSpinner asOverlay />;
  }
  if (!loadedPlace && !error) {
    return (
      <div
        style={{
          textAlign: "center",
          color: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          paddingTop: "20px",
        }}
      >
        <Card>Couldn't find place!</Card>
      </div>
    );
  }

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      {!isLoading && loadedPlace && (
        <form className="place-form" onSubmit={placeUpdateSubmitHandler}>
          <Input
            id="title"
            element="input"
            type="text"
            label="Title"
            validators={[VALIDATOR_REQUIRE()]}
            errorText="Please enter a valid title!"
            onChange={inputHandler}
            initialValue={loadedPlace.title}
            initialValid={true}
          />
          <Input
            id="description"
            element="textarea"
            label="Description"
            validators={[VALIDATOR_MINLENGTH(5)]}
            errorText="Please enter a description (at least 5 characters)."
            onChange={inputHandler}
            initialValue={loadedPlace.description}
            initialValid={true}
          />
          <Button type="submit" disabled={!formState.isValid}>
            UPDATE PLACE
          </Button>
        </form>
      )}
    </>
  );
};

export default UpdatePlace;
