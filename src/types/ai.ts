export type DocumentEdit = {
  mode: "replace_all" | "insert_at_cursor" | "append";
  html: string;
};

export type AiChatResult = {
  reply: string;
  documentEdit?: DocumentEdit;
};
