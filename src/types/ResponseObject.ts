/**
 * 返回消息
 */
export interface ResponseObject<T> {
  /**
   * 状态码
   */
  code?: string;
  /**
   * 结果
   */
  success?: boolean;
  /**
   * 消息
   */
  message?: string;
  /**
   * 消息
   */
  cause?: string;
  /**
   * 结果
   */
  result?: T;
}
