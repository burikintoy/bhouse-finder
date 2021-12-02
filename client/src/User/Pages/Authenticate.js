import { useState, useContext } from "react";

import Card from "../../Shared/Components/UIElements/Card";
import Input from "../../Shared/Components/FormsElement/Input";
import Button from "../../Shared/Components/FormsElement/Button";
import ErrorModal from "../../Shared/Components/UIElements/ErrorModal";
import LoadingSpinner from "../../Shared/Components/UIElements/LoadingSpinner";
import ImageUpload from "../../Shared/Components/FormsElement/ImageUpload";

import {
  VALIDATOR_EMAIL,
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../Shared/util/Validators";
import "./Authenticate.css";
import { useForm } from "../../Shared/Hooks/Form-Hook";
import { AuthContext } from "../../Shared/Context/Auth-Context";
import { useHttpClient } from "../../Shared/Hooks/Http-Hook";

const Authenticate = () => {
  const auth = useContext(AuthContext);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const [formState, inputHandler, setFormData] = useForm({
    email: {
      value: "",
      isValid: false,
    },
    password: {
      value: "",
      isValid: false,
    },
  });

  const switchModeHandler = (event) => {
    if (!isLoginMode) {
      setFormData(
        {
          ...formState.inputs,
          name: undefined,
          image: undefined,
        },
        formState.inputs.email.isValid && formState.inputs.password.isValid
      );
    } else {
      setFormData(
        {
          ...formState.inputs,
          name: {
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
    }
    setIsLoginMode((prevMode) => !prevMode);
  };

  const submitHandler = async (event) => {
    event.preventDefault();

    if (isLoginMode) {
      try {
        const responseData = await sendRequest(
          "http://localhost:5000/api/users/login",
          "POST",
          JSON.stringify({
            email: formState.inputs.email.value,
            password: formState.inputs.password.value,
          }),
          {
            "Content-Type": "application/json",
          }
        );

        auth.login(responseData.userId, responseData.token);
      } catch (error) {}
    } else {
      try {
        const formData = new FormData();
        formData.append("name", formState.inputs.name.value);
        formData.append("email", formState.inputs.email.value);
        formData.append("password", formState.inputs.password.value);
        formData.append("image", formState.inputs.image.value);
        const responseData = await sendRequest(
          "http://localhost:5000/api/users/signup",
          "POST",
          formData
        );

        auth.login(responseData.userId, responseData.token);
      } catch (error) {}
    }
  };

  return (
    <>
      <ErrorModal error={error} onClear={clearError} />
      <Card className="authentication" style={{ backgroundColor: "white" }}>
        {isLoading && <LoadingSpinner asOverlay />}
        <h2>Login Required</h2>
        <hr />
        <form onSubmit={submitHandler}>
          {!isLoginMode && (
            <ImageUpload
              center
              id="image"
              onChange={inputHandler}
              errorText="Please provide an image"
            />
          )}
          {!isLoginMode && (
            <Input
              element="input"
              id="name"
              type="text"
              label="Your Name"
              validators={[VALIDATOR_REQUIRE()]}
              errorText="Please enter a name"
              onChange={inputHandler}
            />
          )}
          <Input
            element="input"
            id="email"
            type="email"
            label="E-mail"
            validators={[VALIDATOR_EMAIL()]}
            errorText="Please enter a valid email address."
            onChange={inputHandler}
          />
          <Input
            element="input"
            id="password"
            type="password"
            label="Password"
            validators={[VALIDATOR_MINLENGTH(6)]}
            errorText="Please enter a valid password (at least 5 characters)."
            onChange={inputHandler}
          />
          <Button type="submit" disabled={!formState.isValid}>
            {isLoginMode ? "LOGIN" : "SIGNUP"}
          </Button>
        </form>
        <Button inverse onClick={switchModeHandler}>
          SWITCH TO {isLoginMode ? "SIGNUP" : "LOGIN"}
        </Button>
      </Card>
    </>
  );
};

export default Authenticate;
