import {
  getAllTicketsAction,
  addTicketsAction,
  getTicketAction,
  updateTicketAction,
  deleteTicketAction,
  updateNoteAction,
  deleteNoteAction
} from "../tickets";
import { ouroborosEndpoint } from "../../constants/services";

export const getAllTicketsThunk = id => async dispatch => {
  try {
    console.log(`${ouroborosEndpoint}/tickets/`);
    const response = await fetch(
      `${ouroborosEndpoint}/tickets?facultyId=${id}`
    );
    const data = await response.json();
    console.log("All tickets fetched");
    dispatch(getAllTicketsAction(data.tickets));
  } catch (error) {
    console.log(error);
  }
};

export const addTicketThunk = tickets => async dispatch => {
  try {
    const response = await fetch(`${ouroborosEndpoint}/tickets/`, {
      method: "POST",
      body: tickets
    });
    const data = await response.json();
    dispatch(addTicketsAction(data));
  } catch (error) {
    console.log(error);
  }
};

export const getTicketThunk = ticketId => async dispatch => {
  try {
    const response = await fetch(`${ouroborosEndpoint}/tickets/${ticketId}`);
    const data = await response.json();
    dispatch(getTicketAction(data));
  } catch (error) {
    console.log(error);
  }
};

export const updateTicketThunk = (ticketId, ticketChange) => async dispatch => {
  try {
    const response = await fetch(`${ouroborosEndpoint}/tickets/${ticketId}`, {
      method: "PUT",
      body: ticketChange
    });
    const data = await response.json();
    dispatch(updateTicketAction(data));
  } catch (error) {
    console.log(error);
  }
};

export const deleteTicketThunk = ticketId => async dispatch => {
  try {
    const response = await fetch(`${ouroborosEndpoint}/tickets/${ticketId}`, {
      method: "DELETE"
    });
    const data = await response.json();
    dispatch(deleteTicketAction(data));
  } catch (error) {
    console.log(error);
  }
};

export const updateNoteThunk = (
  ticketId,
  noteId,
  resolved
) => async dispatch => {
  try {
    const response = await fetch(
      `${ouroborosEndpoint}/tickets/${ticketId}/node/${noteId}`,
      {
        method: "PUT",
        body: { resolved: resolved }
      }
    );
    const data = await response.json();
    dispatch(updateNoteAction(data));
  } catch (error) {
    console.log(error);
  }
};

export const deleteNoteThunk = (ticketId, noteId) => async dispatch => {
  try {
    const response = await fetch(
      `${ouroborosEndpoint}/tickets/${ticketId}/node/${noteId}`,
      {
        method: "DELETE"
      }
    );
    const data = await response.json();
    dispatch(deleteNoteAction(data));
  } catch (error) {
    console.log(error);
  }
};
