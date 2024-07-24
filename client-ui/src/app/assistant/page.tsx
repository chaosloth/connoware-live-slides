"use client";
import { useEffect, useState } from "react";
// import { AssistantChat } from "@twilio-alpha/assistants-react";
import { useSyncClient } from "../../app/context/Sync";
import dynamic from "next/dynamic";

const AssistantChat = dynamic(
  () =>
    import("@twilio-alpha/assistants-react").then(
      (module) => module.AssistantChat
    ),
  { ssr: false }
);

export default function Home() {
  const { token } = useSyncClient();
  const [conversationSid, setConversationSid] = useState<string>();
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    setConversationSid(localStorage.getItem("CONVERSATIONS_SID") || undefined);
  }, []);

  useEffect(() => {
    console.log(`Got new token in AIA`, token);
    setIsReady(true);
  }, [token]);

  function handleConversationSetup(sid: string) {
    localStorage.setItem("CONVERSATIONS_SID", sid);
  }

  return (
    <div className="p-4">
      <h1 className="text-3xl text-slate-600 font-bold">
        Twilio Assistants Demo
      </h1>
      <div className="mt-10">
        {isReady && (
          <AssistantChat
            token={token || ""}
            conversationSid={conversationSid}
            onConversationSetup={handleConversationSetup}
            assistantSid={process.env.NEXT_PUBLIC_ASSISTANT_SID || ""}
          />
        )}
      </div>
    </div>
  );
}
