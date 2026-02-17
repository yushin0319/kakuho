// src/components/ValidatedForm.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm } from "react-hook-form";
import { ReactNode } from "react";
import ValidatedForm from "./ValidatedForm";

// react-hook-form の FormProvider ラッパー
const FormWrapper = ({
  children,
  defaultValues = {},
}: {
  children: ReactNode;
  defaultValues?: Record<string, string>;
}) => {
  const Wrapper = () => {
    const methods = useForm({ defaultValues });
    return <FormProvider {...methods}>{children}</FormProvider>;
  };
  return <Wrapper />;
};

// フォーム送信をテストするためのヘルパー
const FormWithSubmit = ({
  onSubmit,
  children,
  defaultValues = {},
}: {
  onSubmit: (data: Record<string, string>) => void;
  children: ReactNode;
  defaultValues?: Record<string, string>;
}) => {
  const Wrapper = () => {
    const methods = useForm({ defaultValues });
    return (
      <FormProvider {...methods}>
        {children}
        <button type="button" onClick={methods.handleSubmit(onSubmit)}>
          送信
        </button>
      </FormProvider>
    );
  };
  return <Wrapper />;
};

describe("ValidatedForm", () => {
  it("ラベル付きのテキストフィールドをレンダリングする", () => {
    render(
      <FormWrapper>
        <ValidatedForm name="test" label="テスト入力" />
      </FormWrapper>
    );
    expect(screen.getByLabelText("テスト入力")).toBeInTheDocument();
  });

  it("デフォルト値を表示する", () => {
    render(
      <FormWrapper defaultValues={{ title: "初期値" }}>
        <ValidatedForm name="title" label="タイトル" fieldType="title" />
      </FormWrapper>
    );
    expect(screen.getByLabelText("タイトル")).toHaveValue("初期値");
  });

  it("disabled属性が適用される", () => {
    render(
      <FormWrapper>
        <ValidatedForm name="test" label="無効フィールド" disabled />
      </FormWrapper>
    );
    expect(screen.getByLabelText("無効フィールド")).toBeDisabled();
  });

  it("passwordタイプはtype=passwordになる", () => {
    render(
      <FormWrapper>
        <ValidatedForm name="pass" label="パスワード" fieldType="password" />
      </FormWrapper>
    );
    expect(screen.getByLabelText("パスワード")).toHaveAttribute(
      "type",
      "password"
    );
  });

  it("emailタイプはtype=emailになる", () => {
    render(
      <FormWrapper>
        <ValidatedForm name="mail" label="メール" fieldType="email" />
      </FormWrapper>
    );
    expect(screen.getByLabelText("メール")).toHaveAttribute("type", "email");
  });

  it("descriptionタイプはmultilineになる", () => {
    render(
      <FormWrapper>
        <ValidatedForm name="desc" label="説明" fieldType="description" />
      </FormWrapper>
    );
    // multiline TextFieldはtextareaをレンダリングする
    const textarea = screen.getByLabelText("説明");
    expect(textarea.tagName).toBe("TEXTAREA");
  });

  describe("バリデーション", () => {
    it("titleが空の場合エラーメッセージを表示する", async () => {
      const onSubmit = vi.fn();
      render(
        <FormWithSubmit onSubmit={onSubmit}>
          <ValidatedForm name="title" label="タイトル" fieldType="title" />
        </FormWithSubmit>
      );

      await userEvent.click(screen.getByText("送信"));

      await waitFor(() => {
        expect(
          screen.getByText("名前を入力してください")
        ).toBeInTheDocument();
      });
      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("emailが不正な形式の場合エラーメッセージを表示する", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(
        <FormWithSubmit onSubmit={onSubmit}>
          <ValidatedForm name="email" label="メール" fieldType="email" />
        </FormWithSubmit>
      );

      await user.type(screen.getByLabelText("メール"), "invalid-email");
      await user.click(screen.getByText("送信"));

      await waitFor(() => {
        expect(
          screen.getByText("正しいメールアドレス形式で入力してください")
        ).toBeInTheDocument();
      });
    });

    it("passwordが8文字未満の場合エラーメッセージを表示する", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(
        <FormWithSubmit onSubmit={onSubmit}>
          <ValidatedForm
            name="password"
            label="パスワード"
            fieldType="password"
          />
        </FormWithSubmit>
      );

      await user.type(screen.getByLabelText("パスワード"), "abc");
      await user.click(screen.getByText("送信"));

      await waitFor(() => {
        expect(
          screen.getByText("パスワードは8文字以上で入力してください")
        ).toBeInTheDocument();
      });
    });

    it("正しい入力であれば送信が成功する", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(
        <FormWithSubmit onSubmit={onSubmit}>
          <ValidatedForm name="email" label="メール" fieldType="email" />
        </FormWithSubmit>
      );

      await user.type(screen.getByLabelText("メール"), "test@example.com");
      await user.click(screen.getByText("送信"));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          { email: "test@example.com" },
          expect.anything()
        );
      });
    });
  });
});
