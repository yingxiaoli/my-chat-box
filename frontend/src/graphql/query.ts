import {gql} from '@apollo/client'

export const SEND_MESSAGE = gql`
  mutation SendMessage($message: String!) {
    sendMessage(message: $message) {
      id
      content
      role
      timestamp
    }
  }
`