import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authUtils } from "utils/auth";
import { useAuth } from "../../../../contexts/AuthContext";
import styles from "./Login.module.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const PUBLIC_URL = process.env.PUBLIC_URL || "";
const HERO_BG = PUBLIC_URL + "/img/default/hero-login.png";
const USERNAME_ICON = PUBLIC_URL + "/img/auth/username-icon.svg";
const PASSWORD_ICON = PUBLIC_URL + "/img/auth/password-icon.svg";
const EYE_ICON = PUBLIC_URL + "/img/icon/eye.svg";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { fetchRole } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!API_BASE_URL) {
      setModalTitle("네트워크 오류");
      setModalMessage("네트워크 연결에 실패했습니다.");
      setShowModal(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.accessToken && data.refreshToken) {
          authUtils.setTokens({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            tokenType: data.tokenType || "Bearer",
            expiresIn: data.expiresIn || 1800,
          });
          await fetchRole();
          setModalTitle("로그인 성공");
          setModalMessage("로그인에 성공했습니다!");
          setShowModal(true);
          setTimeout(() => {
            navigate("/");
          }, 1000);
        } else {
          setModalTitle("로그인 오류");
          setModalMessage("토큰 정보를 받아오지 못했습니다.");
          setShowModal(true);
        }
      } else {
        setModalTitle("로그인 실패");
        setModalMessage(data.message || "로그인에 실패했습니다.");
        setShowModal(true);
      }
    } catch (error) {
      setModalTitle("오류 발생");
      setModalMessage(error instanceof Error ? `네트워크 오류: ${error.message}` : "로그인 중 오류가 발생했습니다.");
      setShowModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="bg-white w-full h-screen min-h-[700px] flex relative overflow-hidden">
      <div className="flex h-full justify-center items-center bg-white z-10 px-6" style={{ width: "35%", minWidth: "400px", flexShrink: 0 }}>
        <div className="w-[403px] flex flex-col items-stretch gap-10">
          <h1 className="relative w-fit [font-family:'Poppins-SemiBold',Helvetica] font-semibold text-[#171725] text-3xl text-center tracking-[0.10px] leading-[normal]">
            로그인
          </h1>

          <form className="inline-flex flex-col h-[270px] items-start relative w-full" onSubmit={handleSubmit}>
            <div className="inline-flex flex-col items-end gap-8 relative flex-[0_0_auto] w-full">
              <div className="inline-flex flex-col items-start gap-4 relative flex-[0_0_auto] w-full">
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="이메일"
                        className="mt-[-0.80px] [font-family:'Poppins-Medium',Helvetica] font-semibold text-[#171725] placeholder:text-[#9699b7] placeholder:font-medium text-base leading-[normal] relative w-fit tracking-[0.10px] flex-1 bg-transparent border-0 outline-none"
                        aria-label="이메일"
                        required
                      />
                    </label>

                    <label className="flex items-center gap-4 pt-[var(--space-component-padding-medium)] pr-[var(--space-component-padding-xlarge)] pb-[var(--space-component-padding-medium)] pl-[var(--space-component-padding-xlarge)] relative self-stretch w-full flex-[0_0_auto] mb-[-0.80px] ml-[-0.80px] mr-[-0.80px] bg-white rounded-lg border-[1.6px] border-solid border-[#e0e2e9]">
                      <div className="relative w-[19px] h-[19px]" aria-hidden="true">
                        <div className="absolute inset-[-6.06%]">
                          <img className="absolute w-full h-full top-0 left-0" alt="password" src={PASSWORD_ICON} />
                        </div>
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="비밀번호"
                        className="mt-[-0.80px] [font-family:'Poppins-Medium',Helvetica] font-semibold text-[#171725] placeholder:text-[#9699b7] placeholder:font-medium text-base leading-[normal] relative w-fit tracking-[0.10px] flex-1 bg-transparent border-0 outline-none"
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
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2.5 pt-[var(--space-component-padding-medium)] pr-[var(--space-component-padding-6xlarge)] pb-[var(--space-component-padding-medium)] pl-[var(--space-component-padding-6xlarge)] relative self-stretch w-full flex-[0_0_auto] mb-[-0.80px] ml-[-0.80px] mr-[-0.80px] bg-[#0062ff] rounded-lg cursor-pointer hover:bg-[#0052d9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="mt-[-0.80px] [font-family:'Poppins-SemiBold',Helvetica] font-semibold text-white text-[15px] text-center leading-[normal] relative w-fit tracking-[0.10px]">
                      {isLoading ? "로그인 중..." : "Log In"}
                    </span>
                  </button>
                </div>

                <div className="flex w-[403px] items-center justify-end gap-2.5 relative flex-[0_0_auto]">
                  <button
                    type="button"
                    className="mt-[-1.00px] [font-family:'Poppins-SemiBold',Helvetica] font-semibold text-[#0062ff] text-[15px] text-center leading-6 whitespace-nowrap relative w-fit tracking-[0.10px] hover:underline bg-transparent border-0 p-0 cursor-pointer"
                  >
                    비밀번호를 잊으셨나요?
                  </button>
                </div>
              </div>

              <div className="relative w-[401px] h-[12px]" />
            </div>

            <div className="inline-flex items-start gap-2 relative flex-[0_0_auto]">
              <div className="mt-[-1.00px] [font-family:'Poppins-Regular',Helvetica] font-normal text-[#969ab8] text-[15px] text-center leading-6 whitespace-nowrap relative w-fit tracking-[0.10px]">
                아직 계정을 생성하지 않으셨나요?
              </div>
              <Link
                to="/signup"
                className="mt-[-1.00px] [font-family:'Poppins-SemiBold',Helvetica] font-semibold text-[#0062ff] text-[15px] text-center leading-6 whitespace-nowrap relative w-fit tracking-[0.10px] hover:underline"
              >
                회원가입
              </Link>
            </div>
          </form>
        </div>
      </div>

      <div className="relative" style={{ width: "65%", flexShrink: 1, minWidth: "700px" }}>
        <img className="h-full w-full object-cover" alt="Rectangle" src={HERO_BG} />
      </div>

      <div className="hidden lg:block absolute bottom-[71.22%] left-1/2 right-[8.66%] top-[12.73%] z-20">
        <div className="flex flex-col items-end absolute bottom-0 left-[4.48%] right-0 top-[21.32%]">
          <p className="[font-family:'Poppins-SemiBold',Helvetica] font-normal text-[#3a424a] text-[48px] tracking-[-0.96px] leading-[66px] relative min-w-full w-[min-content]">
            <span className="font-semibold text-[#3062d4] tracking-[-0.20px]">다시 입어</span>
            <span className="[font-family:'Poppins-Regular',Helvetica] text-[#3a424a] tracking-[-0.20px]">
              , 패스트 패션 사회를 끝내고{" "}
            </span>
            <span className="font-semibold text-[#3062d4] tracking-[-0.20px]">미래</span>
            <span className="[font-family:'Poppins-Regular',Helvetica] text-[#3a424a] tracking-[-0.20px]">
              가 있는{" "}
            </span>
            <span className="font-semibold text-[#3062d4] tracking-[-0.20px]">오늘</span>
            <span className="[font-family:'Poppins-Regular',Helvetica] text-[#3a424a] tracking-[-0.20px]">
              을 만듭니다
            </span>
          </p>
        </div>
      </div>

      {showModal && (
        <div className={styles["login-modal-overlay"]} onClick={handleCloseModal}>
          <div className={styles["login-modal-content"]} onClick={(e) => e.stopPropagation()}>
            <div className={styles["login-modal-header"]}>
              <h2>{modalTitle}</h2>
              <button className={styles["login-modal-close"]} onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <div className={styles["login-modal-body"]}>
              <p style={{ whiteSpace: "pre-line" }}>{modalMessage}</p>
            </div>
            <div className={styles["login-modal-footer"]}>
              <button className={styles["login-modal-btn"]} onClick={handleCloseModal}>
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
