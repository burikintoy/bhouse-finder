import { useContext } from "react";
import { useHistory } from "react-router-dom";

import Input from "../../Shared/Components/FormsElement/Input";
import Button from "../../Shared/Components/FormsElement/Button";
import ErrorModal from "../../Shared/Components/UIElements/ErrorModal";
import LoadingSpinner from "../../Shared/Components/UIElements/LoadingSpinner";
import ImageUpload from "../../Shared/Components/FormsElement/ImageUpload";

import {
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../Shared/util/Validators";
import { useForm } from "../../Shared/Hooks/Form-Hook";
import { useHttpClient } from "../../Shared/Hooks/Http-Hook";
import { AuthContext } from "../../Shared/Context/Auth-Context";

import "./PlaceForm.css";

const NewPlaces = () => {
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const [formState, inputHandler] = useForm(
    {
      title: {
        value: "",
        isValid: false,
      },
      description: {
        value: "",
        isValid: false,
      },
      address: {
        value: "",
        isValid: false,
      },
      image: {
        value: null,
        isValid: false,
      },
    },
    false
  );

  const history = useHistory();
  const placeSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append("title", formState.inputs.title.value);
      formData.append("description", formState.inputs.description.value);
      formData.append("address", formState.inputs.address.value);
      formData.append("image", formState.inputs.image.value);

      await sendRequest(
       process.env.REACT_APP_BACKEND_URL + "/places/create-place",
        "POST",
        formData,
        {
          Authorization: "Bearer " + auth.token,
        }
      );
      history.push("/");
    } catch (error) {}
  };

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      <form className="place-form" onSubmit={placeSubmitHandler}>
        {isLoading && <LoadingSpinner asOverlay />}
        <Input
          id="title"
          element="input"
          type="text"
          label="Title"
          validators={[VALIDATOR_REQUIRE()]}
          onChange={inputHandler}
          errorText="Please enter a valid title!"
        />
        <Input
          id="address"
          element="input"
          label="Address"
          validators={[VALIDATOR_REQUIRE()]}
          onChange={inputHandler}
          errorText="Please enter valid address!"
        />
        <Input
          id="description"
          element="textarea"
          label="Description"
          validators={[VALIDATOR_MINLENGTH(5)]}
          onChange={inputHandler}
          errorText="Please enter valid description (at least 5 characters)."
        />
        <ImageUpload
          center
          id="image"
          onChange={inputHandler}
          errorText="Please provide an image"
        />
        <Button type="submit" disabled={!formState.isValid}>
          ADD PLACE
        </Button>
      </form>
    </>
  );
};

export default NewPlaces;
