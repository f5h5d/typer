import axios from "axios";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

const EmailVerified = () => {
  const API = import.meta.env.VITE_API;
  const params = useParams();
  const navigate = useNavigate()

  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    if (user) navigate("/")
  }, [user])

  useEffect(() => {
    const verify = async () => {
      axios
        .get(`${API}/auth/verify/${params.token}`)
        .then((response) => {
          toast.success(response.data.message);
          navigate("/")
        }).catch(err => {
          toast.error(err.response.data.message)
          navigate("/")
        })
    };

    verify();
  }, []);
  return <div>YOU HAVE VERIFIED YOUR EMAIL ACCOUNT!!!!</div>;
};

export default EmailVerified;
