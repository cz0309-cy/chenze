package com.fenglin.springboottest.common;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

/**
 * 通用分页返回结构。
 */
@Data
public class PageResult<T> implements Serializable {

    /** 总条数 */
    private long total;

    /** 当前页码，从 1 开始 */
    private long page;

    /** 每页条数 */
    private long size;

    /** 总页数 */
    private long pages;

    /** 当前页数据 */
    private List<T> list;

    public static <T> PageResult<T> of(long total, long page, long size, List<T> list) {
        PageResult<T> r = new PageResult<>();
        r.setTotal(total);
        r.setPage(page);
        r.setSize(size);
        r.setPages(size <= 0 ? 0 : (total + size - 1) / size);
        r.setList(list);
        return r;
    }
}
