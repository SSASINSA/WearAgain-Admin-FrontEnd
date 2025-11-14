import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./SignUp.module.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const PUBLIC_URL = process.env.PUBLIC_URL || "";
const HERO_BG = PUBLIC_URL + "/img/auth/signup-hero-bg.png";
const USERNAME_ICON = PUBLIC_URL + "/img/auth/username-icon.svg";
const USER_ICON = PUBLIC_URL + "/img/icon/user-icon.svg";
const PASSWORD_ICON = PUBLIC_URL + "/img/auth/password-icon.svg";
const EYE_ICON = PUBLIC_URL + "/img/icon/eye.svg";

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
    description: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validatePassword = (password: string): boolean => {
    const hasEnglish = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
    return hasEnglish && hasNumber && hasSpecialChar;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setModalTitle("입력 오류");
      setModalMessage("비밀번호가 일치하지 않습니다.");
      setShowModal(true);
      setShouldRedirect(false);
      return;
    }

    if (!validatePassword(formData.password)) {
      setModalTitle("입력 오류");
      setModalMessage("비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.");
      setShowModal(true);
      setShouldRedirect(false);
      return;
    }

    if (!API_BASE_URL) {
      setModalTitle("네트워크 오류");
      setModalMessage("네트워크 연결에 실패했습니다.");
      setShowModal(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/auth/signup-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          requestedRole: "ADMIN",
          reason: formData.description,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setModalTitle("신청 완료");
        setModalMessage("운영자 가입 신청이 완료되었습니다.\n관리자 승인 후 로그인이 가능합니다.");
        setShowModal(true);
        setShouldRedirect(true);
        setFormData({
          email: "",
          name: "",
          password: "",
          confirmPassword: "",
          description: "",
        });
      } else {
        setModalTitle("가입 신청 실패");
        setModalMessage(data.message || "가입 신청에 실패했습니다.");
        setShowModal(true);
        setShouldRedirect(false);
      }
    } catch (error) {
      setModalTitle("오류 발생");
      setModalMessage(error instanceof Error ? `네트워크 오류: ${error.message}` : "가입 신청 중 오류가 발생했습니다.");
      setShowModal(true);
      setShouldRedirect(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    if (shouldRedirect) {
      navigate("/login");
    }
  };

  return (
    <div
      className="bg-white w-full h-screen min-h-[700px] grid relative overflow-x-auto"
      style={{ gridTemplateColumns: "minmax(0, 1fr) 560px", minWidth: "1280px" }}
    >
      <img className="absolute inset-y-0 left-0 h-full w-auto object-cover" alt="Rectangle" src={HERO_BG} />

      <div className="hidden lg:block absolute w-[41.34%] h-[16.05%] top-[12.73%] left-[8.27%]">
        <div className="flex flex-col w-[95.52%] h-[78.68%] items-end absolute top-[21.32%] left-[4.48%]">
          <p className="self-stretch [font-family:'Poppins-SemiBold',Helvetica] font-normal text-transparent text-[48px] tracking-[-0.96px] leading-[66px] relative mt-[-1.00px]">
            <span className="font-semibold text-[#3062d4] tracking-[-0.20px]">당신</span>
            <span className="[font-family:'Poppins-Regular',Helvetica] text-[#3a424a] tracking-[-0.20px]">이 </span>
            <span className="font-semibold text-[#3062d4] tracking-[-0.20px]">다시 입을 때</span>
            <span className="[font-family:'Poppins-Regular',Helvetica] text-[#3a424a] tracking-[-0.20px]">까지 </span>
            <span className="font-semibold text-[#3062d4] tracking-[-0.20px]">연구</span>
            <span className="[font-family:'Poppins-Regular',Helvetica] text-[#3a424a] tracking-[-0.20px]">합니다</span>
          </p>
        </div>
      </div>

      <div className="col-start-2 flex h-full justify-center bg-white z-10" style={{ minWidth: "560px" }}>
        <div className="my-auto w-[403px] flex flex-col items-stretch gap-10">
          <h1 className="relative w-fit [font-family:'Poppins-SemiBold',Helvetica] font-semibold text-[#171725] text-3xl text-center tracking-[0.10px] leading-[normal]">
            회원가입
          </h1>

          <form className="flex flex-col items-start w-full relative" onSubmit={handleSubmit}>
            <div className="flex flex-col items-end gap-8 relative w-full">
              <div className="flex flex-col items-start gap-4 relative w-full">
                <div className="flex flex-col items-center gap-6 relative self-stretch w-full flex-[0_0_auto]">
                  <div className="flex flex-col items-start gap-4 relative self-stretch w-full flex-[0_0_auto]">
                    <label className="flex items-center gap-4 pt-[var(--space-component-padding-medium)] pr-[var(--space-component-padding-xlarge)] pb-[var(--space-component-padding-medium)] pl-[var(--space-component-padding-xlarge)] relative self-stretch w-full flex-[0_0_auto] mt-[-0.80px] ml-[-0.80px] mr-[-0.80px] bg-white rounded-lg border-[1.6px] border-solid border-[#e0e2e9]">
                      <div className="relative w-[21.5px] h-[17.2px]" aria-hidden="true">
                        <img className="absolute w-full h-full top-0 left-0" alt="" src={USERNAME_ICON} />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="이메일"
                        className="mt-[-0.80px] [font-family:'Poppins-Medium',Helvetica] font-semibold text-[#171725] placeholder:text-[#9699b7] placeholder:font-medium text-base leading-[normal] relative flex-1 min-w-0 bg-transparent border-0 outline-none tracking-[0.10px]"
                        aria-label="이메일"
                        required
                      />
                    </label>

                    <label className="flex items-center gap-4 pt-[var(--space-component-padding-medium)] pr-[var(--space-component-padding-xlarge)] pb-[var(--space-component-padding-medium)] pl-[var(--space-component-padding-xlarge)] relative self-stretch w-full flex-[0_0_auto] ml-[-0.80px] mr-[-0.80px] bg-white rounded-lg border-[1.6px] border-solid border-[#e0e2e9]">
                      <div className="relative w-[21.5px] h-[17.2px]" aria-hidden="true">
                        <img className="absolute w-full h-full top-0 left-0" alt="" src={USER_ICON} />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="이름"
                        className="mt-[-0.80px] [font-family:'Poppins-Medium',Helvetica] font-semibold text-[#171725] placeholder:text-[#9699b7] placeholder:font-medium text-base leading-[normal] relative flex-1 min-w-0 bg-transparent border-0 outline-none tracking-[0.10px]"
                        aria-label="이름"
                        required
                      />
                    </label>

                    <label className="flex items-center gap-4 pt-[var(--space-component-padding-medium)] pr-[var(--space-component-padding-xlarge)] pb-[var(--space-component-padding-medium)] pl-[var(--space-component-padding-xlarge)] relative self-stretch w-full flex-[0_0_auto] ml-[-0.80px] mr-[-0.80px] bg-white rounded-lg border-[1.6px] border-solid border-[#e0e2e9]">
                      <div className="relative w-[19px] h-[19px]" aria-hidden="true">
                        <div className="absolute inset-[-6.06%]">
                          <img className="absolute w-full h-full top-0 left-0" alt="password" src={PASSWORD_ICON} />
                        </div>
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="비밀번호"
                        className="mt-[-0.80px] [font-family:'Poppins-Medium',Helvetica] font-semibold text-[#171725] placeholder:text-[#9699b7] placeholder:font-medium text-base leading-[normal] relative flex-1 min-w-0 bg-transparent border-0 outline-none tracking-[0.10px]"
                        aria-label="비밀번호"
                        required
                      />
                      <div className="relative w-[19px] h-[19px] ml-2" aria-hidden="true">
                        <button
                          type="button"
                          onMouseDown={() => setShowPassword(true)}
                          onMouseUp={() => setShowPassword(false)}
                          onMouseLeave={() => setShowPassword(false)}
                          className="absolute inset-0 flex items-center justify-center cursor-pointer bg-transparent border-0 p-0"
                          aria-label="비밀번호 보기"
                        >
                          <img
                            className="w-full h-full opacity-70"
                            style={{
                              filter:
                                "brightness(0) saturate(100%) invert(67%) sepia(8%) saturate(1000%) hue-rotate(200deg) brightness(95%) contrast(90%)",
                            }}
                            alt="비밀번호 보기"
                            src={EYE_ICON}
                          />
                        </button>
                      </div>
                    </label>

                    <label className="flex items-center gap-4 pt-[var(--space-component-padding-medium)] pr-[var(--space-component-padding-xlarge)] pb-[var(--space-component-padding-medium)] pl-[var(--space-component-padding-xlarge)] relative self-stretch w-full flex-[0_0_auto] ml-[-0.80px] mr-[-0.80px] bg-white rounded-lg border-[1.6px] border-solid border-[#e0e2e9]">
                      <div className="relative w-[19px] h-[19px]" aria-hidden="true">
                        <div className="absolute inset-[-6.06%]">
                          <img className="absolute w-full h-full top-0 left-0" alt="password" src={PASSWORD_ICON} />
                        </div>
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="비밀번호 재입력"
                        className="mt-[-0.80px] [font-family:'Poppins-Medium',Helvetica] font-semibold text-[#171725] placeholder:text-[#9699b7] placeholder:font-medium text-base leading-[normal] relative flex-1 min-w-0 bg-transparent border-0 outline-none tracking-[0.10px]"
                        aria-label="비밀번호 재입력"
                        required
                      />
                      <div className="relative w-[19px] h-[19px] ml-2" aria-hidden="true">
                        <button
                          type="button"
                          onMouseDown={() => setShowConfirmPassword(true)}
                          onMouseUp={() => setShowConfirmPassword(false)}
                          onMouseLeave={() => setShowConfirmPassword(false)}
                          className="absolute inset-0 flex items-center justify-center cursor-pointer bg-transparent border-0 p-0"
                          aria-label="비밀번호 보기"
                        >
                          <img
                            className="w-full h-full opacity-70"
                            style={{
                              filter:
                                "brightness(0) saturate(100%) invert(67%) sepia(8%) saturate(1000%) hue-rotate(200deg) brightness(95%) contrast(90%)",
                            }}
                            alt="비밀번호 보기"
                            src={EYE_ICON}
                          />
                        </button>
                      </div>
                    </label>

                    <div className="flex flex-col items-start gap-2 pt-[var(--space-component-padding-medium)] pr-[var(--space-component-padding-xlarge)] pb-[var(--space-component-padding-medium)] pl-[var(--space-component-padding-xlarge)] relative self-stretch w-full flex-[0_0_auto] mb-[-0.80px] ml-[-0.80px] mr-[-0.80px] bg-white rounded-lg border-[1.6px] border-solid border-[#e0e2e9]">
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="상세 설명"
                        rows={4}
                        className="[font-family:'Poppins-Medium',Helvetica] font-semibold text-[#171725] placeholder:text-[#9699b7] placeholder:font-medium text-base leading-[normal] relative self-stretch w-full min-h-[80px] bg-transparent border-0 outline-none tracking-[0.10px] resize-none"
                        aria-label="상세 설명"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2.5 pt-[var(--space-component-padding-medium)] pr-[var(--space-component-padding-6xlarge)] pb-[var(--space-component-padding-medium)] pl-[var(--space-component-padding-6xlarge)] relative self-stretch w-full flex-[0_0_auto] mb-[-0.80px] ml-[-0.80px] mr-[-0.80px] bg-[#0062ff] rounded-lg cursor-pointer hover:bg-[#0052d9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="mt-[-0.80px] [font-family:'Poppins-SemiBold',Helvetica] font-semibold text-white text-[15px] text-center leading-[normal] relative w-fit tracking-[0.10px]">
                      {isLoading ? "신청 중..." : "회원가입"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="relative w-[401px] h-[32px]" />
            </div>

            <div className="inline-flex items-start gap-2 relative flex-[0_0_auto] mt-[-32px]">
              <div className="mt-[-1.00px] [font-family:'Poppins-Regular',Helvetica] font-normal text-[#969ab8] text-[15px] text-center leading-6 whitespace-nowrap relative w-fit tracking-[0.10px]">
                이미 계정이 있으신가요?
              </div>
              <Link
                to="/login"
                className="mt-[-1.00px] [font-family:'Poppins-SemiBold',Helvetica] font-semibold text-[#0062ff] text-[15px] text-center leading-6 whitespace-nowrap relative w-fit tracking-[0.10px] hover:underline"
              >
                로그인
              </Link>
            </div>
          </form>
        </div>
      </div>

      {showModal && (
        <div className={styles["signup-modal-overlay"]} onClick={handleCloseModal}>
          <div className={styles["signup-modal-content"]} onClick={(e) => e.stopPropagation()}>
            <div className={styles["signup-modal-header"]}>
              <h2>{modalTitle}</h2>
              <button className={styles["signup-modal-close"]} onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <div className={styles["signup-modal-body"]}>
              <p style={{ whiteSpace: "pre-line" }}>{modalMessage}</p>
            </div>
            <div className={styles["signup-modal-footer"]}>
              <button className={styles["signup-modal-btn"]} onClick={handleCloseModal}>
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUp;
