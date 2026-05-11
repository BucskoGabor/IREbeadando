export interface Member {
  id: number;
  name: string;
  phone: string;
  idCardNumber: string;
  address: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  activeLoans?: Loan[];
}

export interface Item {
  id: number;
  title: string;
  author: string;
  type: 'book' | 'cd' | 'cassette' | 'sheet_music';
  acquisitionDate: string;
  status: 'available' | 'borrowed' | 'scrapped';
  createdAt: string;
  updatedAt: string;
  currentLoan?: {
    id: number;
    loanDate: string;
    member: { id: number; name: string; idCardNumber: string };
  } | null;
}

export interface Loan {
  id: number;
  memberId: number;
  itemId: number;
  member: Member;
  item: Item;
  loanDate: string;
  returnDate: string | null;
  createdAt: string;
  totalDays?: number;
  delayDays?: number;
  overdueDaysConfig?: number;
}

export interface Setting {
  id: number;
  key: string;
  value: string;
  description: string | null;
}

export interface LoginResponse {
  token: string;
  user: { id: number; username: string; role: string };
}
