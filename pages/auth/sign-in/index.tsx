import User from "@/components/svgs/User";
import Head from "next/head";
import Link from "next/link";
import React, { useState } from "react";
import {
  Button,
  FieldError,
  Form,
  Input,
  Label,
  TextField,
} from "react-aria-components";
import Swal from "sweetalert2";
import { setCookie } from "nookies";
import { useRouter } from "next/router";
import { SignInService } from "../../../services/auth";
import HomepageSidebar from "../../../components/sidebars/homepageSidebar";

type SignInData = {
  email?: string;
  password?: string;
};

const Index = () => {
  const route = useRouter();

  const [SingInData, setSignInData] = useState<SignInData>({
    email: "",
    password: "",
  });

  const handleChangeSingInForm = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setSignInData((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleSubmitSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();

      Swal.fire({
        title: "กำลังเข้าสู่ระบบ",
        html: "กรุณารอสักครู่",
        timerProgressBar: true,
        allowEscapeKey: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const signIn = await SignInService({
        email: SingInData.email as string,
        password: SingInData.password as string,
      });

      setCookie(null, "access_token", signIn.access_token, {
        maxAge: 2 * 24 * 60 * 60, // Cookie expiration time in seconds (e.g., 30 days)
        path: "/", // Cookie path
      });

      route.push("/");
      Swal.fire({
        title: "เข้าสู่ระบบสำเร็จ",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error: any) {
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: error.message,
        icon: "error",
        confirmButtonText: "ตกลง",
      });
    }
  };

  return (
    <div className=" flex min-h-screen font-Anuphan">
      <Head>
        <title>เข้าสู่ระบบ</title>
      </Head>
      {/* Left */}

      <HomepageSidebar />

      {/* Right */}
      <div className="flex h-full w-full flex-col items-center lg:mt-6 lg:justify-center">
        <div className="my-8 flex w-full flex-col items-center justify-center  ">
          <section className="mt-7 lg:mt-0">
            <h1
              className="\ w-[15.625rem] rounded-full bg-[#C6A969] p-3 px-[3rem] text-center
              text-xl font-semibold text-white md:w-[18rem] md:px-[2rem] lg:text-base"
            >
              เข้าสู่ระบบสำหรับผู้ประเมิน
            </h1>
          </section>

          <div className="my-10 w-[7rem] lg:my-4 ">
            <User />
          </div>

          <Form
            onSubmit={handleSubmitSignIn}
            className="flex w-10/12 flex-col items-center gap-5 md:mt-1 lg:gap-2"
          >
            {/* email password */}
            <TextField
              name="email"
              type="email"
              isRequired
              className="flex flex-col items-center  "
            >
              <div className="flex flex-col items-start justify-start gap-2">
                <Label className="text-xl font-semibold text-[#597E52] md:text-sm">
                  E-mail :
                </Label>
                <Input
                  onChange={handleChangeSingInForm}
                  className="h-10 w-80 rounded-lg border-[1px] border-solid border-slate-300
                   px-3 py-2 text-lg md:py-1"
                />
              </div>
              <div className="flex w-full justify-center">
                <FieldError className="mt-2 w-[90%] text-center text-sm text-red-600" />
              </div>
            </TextField>

            <TextField
              name="password"
              type="password"
              isRequired
              className="flex flex-col items-center "
            >
              <div className="flex flex-col items-start justify-start gap-2">
                <Label className="text-xl font-semibold text-[#597E52] md:text-sm">
                  รหัสผ่าน :
                </Label>
                <Input
                  onChange={handleChangeSingInForm}
                  className="h-10 w-80 rounded-lg border-[1px] border-solid border-slate-300
                  px-3 py-2 text-lg md:py-1"
                />
              </div>
              <div className="flex w-full justify-center">
                <FieldError className="mt-2 w-[90%] text-center text-sm text-red-600" />
              </div>
            </TextField>

            <Button
              type="submit"
              className="mt-5 w-60 rounded-full bg-[#597E52] p-1 py-2 text-center 
              text-xl font-semibold text-white drop-shadow-lg duration-300 hover:bg-[#81b077] md:text-base"
            >
              ลงทะเบียน
            </Button>
          </Form>
          <section className="mt-2 flex w-60 items-center  justify-between">
            <Link
              className="text-sm font-medium text-blue-500"
              href="/auth/forget-password"
            >
              <button className="underline">ลืมรหัสผ่าน?</button>
            </Link>
            <Link
              className="text-sm font-medium text-blue-500"
              href="/auth/sign-up"
            >
              <button className="underline">ไม่มีบัญชี?</button>
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Index;
