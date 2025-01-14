import { useQuery } from "@tanstack/react-query";
import React, { FormEvent, useEffect, useState } from "react";
import { FaSquarePhone } from "react-icons/fa6";
import {
  ChildEvalTopicKos06,
  EvalTopicKos06,
  FormEvaluation,
  ListFormEvaluation,
  StatusEvaluation,
} from "../../model";
import {
  CreateListFormEvaluationService,
  GetFormEvaluationService,
  UpdateFormEvaluationService,
  UpdateListFormEvaluationService,
} from "../../services/evaluation";
import { useRouter } from "next/router";
import {
  Button,
  Form,
  Label,
  Radio,
  RadioGroup,
  TextArea,
  TextField,
} from "react-aria-components";
import {
  MdEmail,
  MdOutlineRadioButtonChecked,
  MdOutlineRadioButtonUnchecked,
} from "react-icons/md";
import { IoIosCheckbox, IoIosCheckboxOutline } from "react-icons/io";
import Swal from "sweetalert2";
import { GetUserService } from "../../services/user";

type UpdateFormEvaluationProps = {
  selectFormEvaluation: FormEvaluation;
};
function UpdateFormEvaluation({
  selectFormEvaluation,
}: UpdateFormEvaluationProps) {
  const router = useRouter();
  const user = useQuery({
    queryKey: ["user"],
    queryFn: () => GetUserService({}),
  });
  const [evaluationListData, setEvaluationListData] = useState<
    {
      evalTopicKos06Id: string;
      childEvalTopicKos06Id: string;
      id: string;
      title: string;
      listFormEvaluation: {
        id?: string;
        status: StatusEvaluation;
        suggestion?: string;
      };
    }[]
  >();
  const [evaluationData, setEvaluationData] = useState<{
    id?: string;
    status?: StatusEvaluation;
    reason?: string;
  }>();

  const formEvaluation = useQuery({
    queryKey: ["formEvaluation", selectFormEvaluation.id],
    queryFn: () =>
      GetFormEvaluationService({
        formEvaluationId: selectFormEvaluation.id as string,
        farmerId: router.query.farmerId as string,
      }),
  });

  useEffect(() => {
    setEvaluationListData(() => {
      return formEvaluation.data?.topics
        .map((topic) => {
          return topic.childs.map((child) => {
            return {
              evalTopicKos06Id: topic.id,
              id: child.id,
              title: child.title,
              childEvalTopicKos06Id: child.id,
              listFormEvaluation: child.listFormEvaluation || {
                status: "pending",
                suggestion: "",
              },
            };
          });
        })
        .flat();
    });
    setEvaluationData(() => {
      return {
        id: formEvaluation.data?.formEvaluation.id as string,
        status: formEvaluation.data?.formEvaluation.status as StatusEvaluation,
        reason: formEvaluation.data?.formEvaluation.reason as string,
      };
    });
  }, [formEvaluation.data]);

  const handleSummitEvaluation = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      Swal.fire({
        title: "กำลังบันทึกการประเมิน",
        allowEscapeKey: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const updatePromise = UpdateFormEvaluationService({
        query: {
          formEvaluationId: selectFormEvaluation.id as string,
          farmerId: router.query.farmerId as string,
        },
        body: {
          ...evaluationData,
          approveByUserId: user.data?.id as string,
        },
      });

      const createPromises = evaluationListData?.map(async (list) => {
        if (list.listFormEvaluation.id) {
          return UpdateListFormEvaluationService({
            query: {
              listFormEvaluationId: list.listFormEvaluation.id as string,
            },
            body: {
              status: list.listFormEvaluation.status,
              suggestion: list.listFormEvaluation.suggestion as string,
            },
          });
        } else if (!list.listFormEvaluation.id) {
          return CreateListFormEvaluationService({
            status: list.listFormEvaluation.status,
            formEvaluationId: selectFormEvaluation.id as string,
            farmerId: router.query.farmerId as string,
            childEvalTopicKos06Id: list.childEvalTopicKos06Id as string,
            evalTopicKos06Id: list.evalTopicKos06Id as string,
            suggestion: list.listFormEvaluation.suggestion as string,
          });
        }
      });
      if (createPromises) {
        await Promise.all([updatePromise, ...createPromises]);
      } else if (!createPromises) {
        await Promise.all([updatePromise]);
      }
      await formEvaluation.refetch();
      Swal.fire({
        icon: "success",
        title: "สำเร็จ",
        text: "บันทึกการประเมินเรียบร้อย",
      });
    } catch (error: any) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.message,
      });
    }
  };
  return (
    <Form
      onSubmit={handleSummitEvaluation}
      className="mt-5 flex w-full flex-col items-center"
    >
      <header className="sticky top-0 z-20 grid w-11/12 grid-cols-10 items-center justify-center gap-2  text-xl font-semibold text-white ">
        <div className=" col-span-6 rounded-lg bg-fifth-color px-3 py-1 text-center">
          รายการการประเมิน
        </div>
        <div className=" col-span-1 rounded-lg bg-fifth-color px-3 py-1 text-center">
          ใช่
        </div>
        <div className=" col-span-1 rounded-lg bg-fifth-color px-3 py-1 text-center">
          ไม่ใช่
        </div>
        <div className=" col-span-2 rounded-lg bg-fifth-color px-3 py-1 text-center">
          ข้อเสนอแนะ
        </div>
      </header>
      <main
        className="mt-5 flex w-11/12 flex-col items-center justify-center gap-2  text-xl font-semibold text-white 
      "
      >
        {formEvaluation.isLoading
          ? [...new Array(5)].map((list, index) => {
              return (
                <div
                  key={index}
                  className="grid h-10 w-full animate-pulse grid-cols-10 gap-2"
                >
                  <div className="col-span-6 h-10 animate-pulse rounded-lg bg-gray-400"></div>
                  <div className="col-span-1 h-10 animate-pulse rounded-lg bg-gray-300"></div>
                  <div className="col-span-1 h-10 animate-pulse rounded-lg bg-gray-500"></div>
                  <div className="col-span-2 h-10 animate-pulse rounded-lg bg-gray-300"></div>
                </div>
              );
            })
          : formEvaluation.data?.topics.map((topic, index) => {
              return (
                <section className="grid w-full grid-cols-10 gap-3" key={index}>
                  <div className="sticky top-10 col-span-10 flex items-center justify-start gap-2 rounded-lg bg-secondary-color p-3 font-semibold text-white">
                    {topic.order} {topic.title}
                  </div>
                  {topic.childs.map((child, index) => {
                    return (
                      <RadioGroup
                        aria-label="evaluation"
                        name={child.id}
                        key={index}
                        isRequired
                        onChange={(e) => {
                          setEvaluationListData((prev) => {
                            return prev?.map((item) => {
                              if (item.id === child.id) {
                                return {
                                  ...item,
                                  listFormEvaluation: {
                                    ...item.listFormEvaluation,
                                    status: e as StatusEvaluation,
                                  },
                                };
                              }
                              return item;
                            });
                          });
                        }}
                        value={
                          evaluationListData?.find(
                            (item) => item.id === child.id,
                          )?.listFormEvaluation?.status
                        }
                        className="col-span-10 grid w-full grid-cols-10 gap-3"
                      >
                        <div className="col-span-6 rounded-lg bg-fourth-color p-5 font-medium text-black">
                          {child.order} {child.title}
                        </div>
                        <Radio
                          aria-label="approved"
                          className="col-span-1 flex items-center justify-center rounded-lg bg-fourth-color p-5"
                          value="approved"
                        >
                          {({ isSelected }) => (
                            <div className="text-4xl text-secondary-color">
                              {isSelected ? (
                                <IoIosCheckbox />
                              ) : (
                                <IoIosCheckboxOutline />
                              )}
                            </div>
                          )}
                        </Radio>
                        <Radio
                          aria-label="rejected"
                          className="col-span-1 flex items-center justify-center rounded-lg bg-fourth-color p-5"
                          value="rejected"
                        >
                          {({ isSelected }) => (
                            <div className="text-4xl text-red-600">
                              {isSelected ? (
                                <IoIosCheckbox />
                              ) : (
                                <IoIosCheckboxOutline />
                              )}
                            </div>
                          )}
                        </Radio>
                        <TextField
                          onChange={(e) => {
                            setEvaluationListData((prev) => {
                              return prev?.map((item) => {
                                if (item.id === child.id) {
                                  return {
                                    ...item,
                                    listFormEvaluation: {
                                      ...item.listFormEvaluation,
                                      suggestion: e,
                                    },
                                  };
                                }
                                return item;
                              });
                            });
                          }}
                          value={
                            evaluationListData?.find(
                              (item) => item.id === child.id,
                            )?.listFormEvaluation?.suggestion
                          }
                          aria-label="note"
                          className="col-span-2 flex items-center justify-center rounded-lg bg-fourth-color p-1 text-sm text-black"
                        >
                          <TextArea
                            placeholder="....ข้อเสนอแนะ"
                            className="h-full max-h-full min-h-full w-full min-w-full max-w-full resize-none border-0 p-2 outline-none"
                          />
                        </TextField>
                      </RadioGroup>
                    );
                  })}
                </section>
              );
            })}
      </main>
      <footer className="mt-5 flex w-full flex-col items-center justify-center gap-5">
        <div className="w-11/12 rounded-lg bg-fifth-color px-3 py-1 text-left text-xl font-semibold text-white ">
          สรุปผลการประเมิน
        </div>
        <div className="flex w-11/12 flex-col gap-4 rounded-lg bg-fourth-color p-5">
          <RadioGroup
            isRequired
            onChange={(e) => {
              setEvaluationData((prev) => {
                return {
                  ...prev,
                  status: e as StatusEvaluation,
                };
              });
            }}
            value={evaluationData?.status}
            aria-label="evaluation"
            className=" grid w-full grid-cols-2 gap-3"
          >
            <Radio
              aria-label="approved"
              className="col-span-1 flex items-center justify-center rounded-lg bg-fourth-color p-5"
              value="approved"
            >
              {({ isSelected }) => (
                <div className="flex items-center justify-center gap-2 text-4xl text-secondary-color">
                  {isSelected ? <IoIosCheckbox /> : <IoIosCheckboxOutline />}{" "}
                  <span className="text-lg font-bold text-secondary-color">
                    ผ่านการประเมิน
                  </span>
                </div>
              )}
            </Radio>
            <Radio
              aria-label="rejected"
              className="col-span-1 flex items-center justify-center rounded-lg bg-fourth-color p-5"
              value="rejected"
            >
              {({ isSelected }) => (
                <div className="flex items-center justify-center gap-2 text-4xl text-red-600">
                  {isSelected ? <IoIosCheckbox /> : <IoIosCheckboxOutline />}
                  <span className="text-lg font-bold text-red-600">
                    ไม่ผ่านการประเมิน
                  </span>
                </div>
              )}
            </Radio>
          </RadioGroup>
          {formEvaluation.data?.formEvaluation.user && (
            <div className="flex w-full items-center justify-start gap-5 text-lg font-semibold text-black">
              <h3>ประเมินโดย</h3>
              <h3>
                {formEvaluation.data?.formEvaluation.user.firstName}{" "}
                {formEvaluation.data?.formEvaluation.user.lastName}
              </h3>
              <h3 className="flex items-center justify-start gap-2 text-super-main-color">
                <MdEmail />
                {formEvaluation.data?.formEvaluation.user.email}{" "}
              </h3>
              <h3 className="flex items-center justify-start gap-2 text-super-main-color">
                <FaSquarePhone />
                {formEvaluation.data?.formEvaluation.user.phone}{" "}
              </h3>
            </div>
          )}
          <TextField
            onChange={(e) => {
              setEvaluationData((prev) => {
                return {
                  ...prev,
                  reason: e,
                };
              });
            }}
            value={evaluationData?.reason}
          >
            <Label className="text-lg font-semibold text-super-main-color">
              เนื่องจาก:{" "}
            </Label>
            <TextArea
              placeholder="..ข้อเสนอแนะ"
              className="h-32 w-full resize-none rounded-lg border-0 p-5 text-lg outline-none ring-1 ring-black"
            ></TextArea>
          </TextField>

          <Button
            type="submit"
            className="button-focus w-60 rounded-lg bg-super-main-color p-2 text-lg font-semibold text-white"
          >
            บันทึก
          </Button>
        </div>
      </footer>
    </Form>
  );
}

export default UpdateFormEvaluation;
